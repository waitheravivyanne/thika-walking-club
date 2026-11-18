from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from extensions import db
from models import TrainingEnquiry
from auth_utils import admin_required


training_bp = Blueprint("training", __name__)


def serialize_enquiry(enquiry):
    return {
        "id": enquiry.id,
        "full_name": enquiry.full_name,
        "email": enquiry.email,
        "phone": enquiry.phone,
        "preferred_days": enquiry.preferred_days,
        "preferred_time": enquiry.preferred_time,
        "message": enquiry.message,
        "package_name": enquiry.package_name,
        "package_price": float(enquiry.package_price),
        "status": enquiry.status,
        "created_at": (
            enquiry.created_at.isoformat()
            if enquiry.created_at else None
        )
    }


@training_bp.route("/", methods=["POST"])
def submit_training_enquiry():
    data = request.get_json(silent=True) or {}

    required = ["full_name", "email", "phone"]

    if any(
        not isinstance(data.get(field), str)
        or not data[field].strip()
        for field in required
    ):
        return jsonify({
            "status": "error",
            "message": "Please provide your full name, email and phone number."
        }), 400

    full_name = data["full_name"].strip()
    email = data["email"].strip()
    phone = data["phone"].strip()

    if len(full_name) > 120 or len(email) > 120 or len(phone) > 20:
        return jsonify({
            "status": "error",
            "message": "One or more fields are too long."
        }), 400

    if "@" not in email or "." not in email.rsplit("@", 1)[-1]:
        return jsonify({
            "status": "error",
            "message": "Please provide a valid email address."
        }), 400

    preferred_days = data.get("preferred_days", "")
    preferred_time = data.get("preferred_time", "")
    message = data.get("message", "")

    if not all(
        isinstance(value, str)
        for value in [preferred_days, preferred_time, message]
    ):
        return jsonify({
            "status": "error",
            "message": "Invalid enquiry details."
        }), 400

    if (
        len(preferred_days) > 200
        or len(preferred_time) > 120
        or len(message) > 3000
    ):
        return jsonify({
            "status": "error",
            "message": "Enquiry details exceed the allowed length."
        }), 400

    enquiry = TrainingEnquiry(
        full_name=full_name,
        email=email,
        phone=phone,
        preferred_days=preferred_days.strip() or None,
        preferred_time=preferred_time.strip() or None,
        message=message.strip() or None,
        package_name="Personal Training - 5 Sessions",
        package_price=1000,
        status="New"
    )

    try:
        db.session.add(enquiry)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Your personal training enquiry has been submitted. The TWC team will contact you.",
            "enquiry": {
                "id": enquiry.id,
                "package_name": enquiry.package_name,
                "package_price": float(enquiry.package_price),
                "status": enquiry.status
            }
        }), 201

    except SQLAlchemyError:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Unable to submit your enquiry. Please try again."
        }), 500


@training_bp.route("/admin", methods=["GET"])
@admin_required()
def admin_training_enquiries():
    enquiries = TrainingEnquiry.query.order_by(
        TrainingEnquiry.created_at.desc()
    ).all()

    return jsonify({
        "status": "success",
        "enquiries": [
            serialize_enquiry(enquiry)
            for enquiry in enquiries
        ]
    }), 200


@training_bp.route("/admin/<int:enquiry_id>", methods=["PATCH"])
@admin_required()
def update_training_enquiry(enquiry_id):
    enquiry = db.session.get(TrainingEnquiry, enquiry_id)

    if not enquiry:
        return jsonify({
            "status": "error",
            "message": "Training enquiry not found."
        }), 404

    data = request.get_json(silent=True) or {}

    if "status" not in data:
        return jsonify({
            "status": "error",
            "message": "Please provide an enquiry status."
        }), 400

    allowed_statuses = {
        "New",
        "Contacted",
        "Scheduled",
        "Completed",
        "Declined"
    }

    if data["status"] not in allowed_statuses:
        return jsonify({
            "status": "error",
            "message": "Invalid enquiry status."
        }), 400

    enquiry.status = data["status"]

    try:
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Training enquiry updated successfully.",
            "enquiry": serialize_enquiry(enquiry)
        }), 200

    except SQLAlchemyError:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Unable to update training enquiry."
        }), 500
