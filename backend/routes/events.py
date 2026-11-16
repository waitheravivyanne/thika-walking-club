from datetime import date, time
from decimal import Decimal, InvalidOperation

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from extensions import db
from models import Event, EventRegistration, Member
from auth_utils import admin_required


events_bp = Blueprint("events", __name__)


# ==========================================
# EVENT SERIALIZATION
# ==========================================

def event_data(event):
    return {
        "id": event.id,
        "name": event.name,
        "category": event.category,
        "description": event.description,
        "event_date": event.event_date.isoformat(),
        "event_time": event.event_time.strftime("%H:%M"),
        "location": event.location,
        "fee": float(event.fee),
        "capacity": event.capacity,
        "status": event.status,
        "registered_count": len([
            registration
            for registration in event.registrations
            if registration.status in [
                "Registered",
                "Pending Payment"
            ]
        ])
    }


# ==========================================
# REGISTRATION SERIALIZATION
# ==========================================

def registration_data(registration):
    member = registration.member

    return {
        "id": registration.id,
        "event_id": registration.event_id,
        "event_name": registration.event.name,
        "event_date": registration.event.event_date.isoformat(),
        "event_time": registration.event.event_time.strftime("%H:%M"),
        "location": registration.event.location,
        "fee": float(registration.event.fee),
        "status": registration.status,
        "payment_status": registration.payment_status,
        "mpesa_transaction_code": registration.mpesa_transaction_code,
        "created_at": (
            registration.created_at.isoformat()
            if registration.created_at else None
        ),
        "member": {
            "id": member.id if member else None,
            "full_name": member.full_name if member else "Former Member",
            "email": member.email if member else None,
            "phone": member.phone if member else None
        }
    }


# ==========================================
# EVENT DATA VALIDATION
# ==========================================

def validate_event_data(data):

    name = data.get("name")
    category = data.get("category")
    description = data.get("description")
    location = data.get("location")

    if not all(
        isinstance(value, str) and value.strip()
        for value in [
            name,
            category,
            description,
            location
        ]
    ):
        raise ValueError(
            "Name, category, description and location are required."
        )

    try:
        event_date = date.fromisoformat(
            data.get("event_date", "")
        )

        event_time = time.fromisoformat(
            data.get("event_time", "")
        )

        fee = Decimal(
            str(data.get("fee", 0))
        )

    except (ValueError, TypeError, InvalidOperation):
        raise ValueError(
            "Enter a valid event date, time and fee."
        )

    if not fee.is_finite() or fee < 0:
        raise ValueError(
            "Event fee cannot be negative."
        )

    capacity = data.get("capacity")

    if capacity in [None, ""]:
        capacity = None

    else:
        try:
            capacity = int(capacity)

        except (ValueError, TypeError):
            raise ValueError(
                "Capacity must be a whole number."
            )

        if capacity < 1:
            raise ValueError(
                "Capacity must be greater than zero."
            )

    status = data.get("status", "Draft")

    if status not in [
        "Draft",
        "Published",
        "Cancelled"
    ]:
        raise ValueError(
            "Invalid event status."
        )

    return {
        "name": name.strip(),
        "category": category.strip(),
        "description": description.strip(),
        "event_date": event_date,
        "event_time": event_time,
        "location": location.strip(),
        "fee": fee,
        "capacity": capacity,
        "status": status
    }


# ==========================================
# ==========================================
# PUBLIC: GET PUBLISHED EVENTS
# ==========================================

@events_bp.route("/", methods=["GET"])
def get_published_events():
    today = date.today()

    events = Event.query.filter(
        Event.status == "Published",
        Event.event_date >= today
    ).order_by(
        Event.event_date.asc(),
        Event.event_time.asc()
    ).all()

    return jsonify({
        "status": "success",
        "events": [
            event_data(event)
            for event in events
        ]
    }), 200


# MEMBER EVENT REGISTRATION
# ONLY ONE REGISTRATION ROUTE
# ==========================================

@events_bp.route(
    "/<int:event_id>/register",
    methods=["POST"]
)
@jwt_required()
def register_for_event(event_id):

    member_id = get_jwt_identity()

    data = request.get_json(silent=True) or {}

    try:
        member = db.session.get(
            Member,
            int(member_id)
        )

    except (ValueError, TypeError):
        member = None

    if (
        not member
        or not member.is_active
        or member.role != "member"
    ):
        return jsonify({
            "status": "error",
            "message": "An active member account is required."
        }), 403

    event = db.session.get(
        Event,
        event_id
    )

    if not event or event.status != "Published":
        return jsonify({
            "status": "error",
            "message": "This event is not available for registration."
        }), 404

    if event.event_date < date.today():
        return jsonify({
            "status": "error",
            "message": "Registration for this event has closed."
        }), 409

    # Determine whether the event is free.

    is_free = Decimal(str(event.fee)) == 0

    # ======================================
    # M-PESA TRANSACTION CODE VALIDATION
    # ======================================

    raw_code = data.get(
        "mpesa_transaction_code",
        ""
    )

    if not isinstance(raw_code, str):
        return jsonify({
            "status": "error",
            "message": "Invalid M-Pesa transaction code."
        }), 400

    transaction_code = raw_code.strip().upper()

    if not is_free:

        if not transaction_code:
            return jsonify({
                "status": "error",
                "message": (
                    "Please enter your M-Pesa transaction code."
                )
            }), 400

        if len(transaction_code) > 40:
            return jsonify({
                "status": "error",
                "message": (
                    "M-Pesa transaction code cannot exceed 40 characters."
                )
            }), 400

    # ======================================
    # CHECK EXISTING REGISTRATION
    # ======================================

    existing = EventRegistration.query.filter_by(
        event_id=event_id,
        member_id=member.id
    ).first()

    if existing:
        return jsonify({
            "status": "error",
            "message": (
                "You are already registered for this event."
            )
        }), 409

    # ======================================
    # CHECK EVENT CAPACITY
    # ======================================

    active_registrations = EventRegistration.query.filter(
        EventRegistration.event_id == event_id,
        EventRegistration.status.in_([
            "Registered",
            "Pending Payment"
        ])
    ).count()

    if (
        event.capacity is not None
        and active_registrations >= event.capacity
    ):
        return jsonify({
            "status": "error",
            "message": "This event is fully booked."
        }), 409

    # ======================================
    # CREATE REGISTRATION
    # ======================================

    registration = EventRegistration(
        event_id=event_id,
        member_id=member.id,

        status=(
            "Registered"
            if is_free
            else "Pending Payment"
        ),

        mpesa_transaction_code=(
            None
            if is_free
            else transaction_code
        ),

        payment_status=(
            "Not Required"
            if is_free
            else "Verification Pending"
        )
    )

    try:

        db.session.add(registration)

        db.session.commit()

        return jsonify({
            "status": "success",

            "message": (
                "You have registered successfully."
                if is_free
                else (
                    "Registration recorded. Your M-Pesa payment "
                    "is awaiting verification by TWC."
                )
            ),

            "registration": registration_data(
                registration
            )

        }), 201

    except IntegrityError:

        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": (
                "You are already registered for this event."
            )
        }), 409

    except SQLAlchemyError:

        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": (
                "Unable to complete registration."
            )
        }), 500


# ==========================================
# ADMIN: GET ALL EVENTS
# ==========================================

@events_bp.route(
    "/admin",
    methods=["GET"]
)
@admin_required()
def get_all_events():

    events = Event.query.order_by(
        Event.event_date.desc(),
        Event.created_at.desc()
    ).all()

    return jsonify({
        "status": "success",
        "events": [
            event_data(event)
            for event in events
        ]
    }), 200


# ==========================================
# ADMIN: CREATE EVENT
# ==========================================

@events_bp.route(
    "/admin",
    methods=["POST"]
)
@admin_required()
def create_event():

    data = request.get_json(silent=True) or {}

    try:

        values = validate_event_data(data)

        event = Event(**values)

        db.session.add(event)

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Event created successfully.",
            "event": event_data(event)
        }), 201

    except ValueError as error:

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 400

    except SQLAlchemyError:

        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Unable to create event."
        }), 500


# ==========================================
# ADMIN: UPDATE EVENT
# ==========================================

@events_bp.route(
    "/admin/<int:event_id>",
    methods=["PUT"]
)
@admin_required()
def update_event(event_id):

    event = db.session.get(
        Event,
        event_id
    )

    if not event:
        return jsonify({
            "status": "error",
            "message": "Event not found."
        }), 404

    data = request.get_json(silent=True) or {}

    try:

        values = validate_event_data(data)

        for key, value in values.items():
            setattr(event, key, value)

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Event updated successfully.",
            "event": event_data(event)
        }), 200

    except ValueError as error:

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 400

    except SQLAlchemyError:

        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Unable to update event."
        }), 500


# ==========================================
# ADMIN: VIEW EVENT REGISTRATIONS
# ==========================================

@events_bp.route(
    "/admin/<int:event_id>/registrations",
    methods=["GET"]
)
@admin_required()
def get_event_registrations(event_id):

    event = db.session.get(
        Event,
        event_id
    )

    if not event:
        return jsonify({
            "status": "error",
            "message": "Event not found."
        }), 404

    registrations = EventRegistration.query.filter_by(
        event_id=event_id
    ).order_by(
        EventRegistration.created_at.desc()
    ).all()

    return jsonify({
        "status": "success",

        "event": event_data(event),

        "registrations": [
            registration_data(registration)
            for registration in registrations
        ]

    }), 200
# ==========================================
# ADMIN: VERIFY EVENT REGISTRATION PAYMENT
# ==========================================

@events_bp.route(
    "/admin/registrations/<int:registration_id>/payment",
    methods=["PATCH"]
)
@admin_required()
def update_event_registration_payment(registration_id):

    registration = db.session.get(
        EventRegistration,
        registration_id
    )

    if not registration:
        return jsonify({
            "status": "error",
            "message": "Registration not found."
        }), 404

    data = request.get_json(silent=True) or {}

    payment_status = data.get("payment_status")

    allowed_statuses = [
        "Paid",
        "Rejected",
        "Verification Pending"
    ]

    if payment_status not in allowed_statuses:
        return jsonify({
            "status": "error",
            "message": "Invalid payment status."
        }), 400

    if Decimal(str(registration.event.fee)) == 0:
        return jsonify({
            "status": "error",
            "message": "Free event registrations do not require payment verification."
        }), 409

    if not registration.mpesa_transaction_code:
        return jsonify({
            "status": "error",
            "message": "This registration has no M-Pesa transaction code."
        }), 400

    try:

        registration.payment_status = payment_status

        if payment_status == "Paid":
            registration.status = "Registered"
        else:
            registration.status = "Pending Payment"

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": (
                "Payment marked as paid."
                if payment_status == "Paid"
                else (
                    "Payment marked as rejected."
                    if payment_status == "Rejected"
                    else "Payment returned to verification pending."
                )
            ),
            "registration": registration_data(registration)
        }), 200

    except SQLAlchemyError:

        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Unable to update payment status."
        }), 500


# ==========================================
# MEMBER: VIEW MY REGISTRATIONS
# ==========================================

@events_bp.route(
    "/my-registrations",
    methods=["GET"]
)
@jwt_required()
def get_my_registrations():

    member_id = get_jwt_identity()

    try:
        member = db.session.get(
            Member,
            int(member_id)
        )

    except (ValueError, TypeError):
        member = None

    if not member or not member.is_active:
        return jsonify({
            "status": "error",
            "message": "Active member account required."
        }), 403

    registrations = EventRegistration.query.filter_by(
        member_id=member.id
    ).order_by(
        EventRegistration.created_at.desc()
    ).all()

    return jsonify({
        "status": "success",

        "registrations": [
            registration_data(registration)
            for registration in registrations
        ]

    }), 200