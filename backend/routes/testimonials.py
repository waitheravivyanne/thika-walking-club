from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models import Member, Testimonial
from auth_utils import admin_required


testimonials_bp = Blueprint("testimonials", __name__)


def get_active_member():
    try:
        member_id = int(get_jwt_identity())
    except (TypeError, ValueError):
        return None

    member = db.session.get(Member, member_id)

    if (
        not member
        or not member.is_active
        or (member.role or "").lower() == "admin"
    ):
        return None

    return member


def testimonial_data(item):
    member = item.member

    return {
        "id": item.id,
        "member_id": item.member_id,
        "full_name": (
            member.full_name if member else "Former Member"
        ),
        "message": item.message,
        "status": item.status,
        "created_at": (
            item.created_at.isoformat()
            if item.created_at else None
        )
    }


# PUBLIC: Homepage displays approved testimonials only.
@testimonials_bp.route("/", methods=["GET"])
def get_public_testimonials():
    items = Testimonial.query.filter_by(
        status="Approved",
        consent_to_publish=True
    ).join(Member).filter(
        Member.is_active.is_(True)
    ).order_by(
        Testimonial.created_at.desc()
    ).all()

    return jsonify({
        "status": "success",
        "testimonials": [testimonial_data(item) for item in items],
        "total": len(items)
    }), 200


# MEMBER: View the current member's testimonial and its review status.
@testimonials_bp.route("/mine", methods=["GET"])
@jwt_required()
def get_my_testimonial():
    member = get_active_member()

    if not member:
        return jsonify({
            "status": "error",
            "message": "An active member account is required."
        }), 403

    item = Testimonial.query.filter_by(
        member_id=member.id
    ).first()

    return jsonify({
        "status": "success",
        "testimonial": testimonial_data(item) if item else None
    }), 200


# MEMBER: Submit or update one testimonial.
@testimonials_bp.route("/", methods=["POST"])
@jwt_required()
def submit_testimonial():
    member = get_active_member()

    if not member:
        return jsonify({
            "status": "error",
            "message": "An active member account is required."
        }), 403

    data = request.get_json(silent=True) or {}

    message = data.get("message")
    consent = data.get("consent_to_publish")

    if not isinstance(message, str):
        return jsonify({
            "status": "error",
            "message": "Please enter your testimonial."
        }), 400

    message = message.strip()

    if len(message) < 20 or len(message) > 1000:
        return jsonify({
            "status": "error",
            "message": "Your testimonial must be between 20 and 1000 characters."
        }), 400

    if consent is not True:
        return jsonify({
            "status": "error",
            "message": "Please agree to publication before submitting."
        }), 400

    item = Testimonial.query.filter_by(
        member_id=member.id
    ).first()

    try:
        if item:
            item.message = message
            item.consent_to_publish = True
            item.status = "Pending"
        else:
            item = Testimonial(
                member_id=member.id,
                message=message,
                consent_to_publish=True,
                status="Pending"
            )
            db.session.add(item)

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Your testimonial has been submitted for administrator review.",
            "testimonial": testimonial_data(item)
        }), 201

    except Exception:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Unable to submit your testimonial. Please try again."
        }), 500


# ADMIN: View all testimonials, optionally filtered by status.
@testimonials_bp.route("/admin", methods=["GET"])
@admin_required()
def get_all_testimonials():
    status = (request.args.get("status") or "").strip()

    query = Testimonial.query

    if status:
        if status not in ["Pending", "Approved", "Rejected"]:
            return jsonify({
                "status": "error",
                "message": "Invalid testimonial status."
            }), 400

        query = query.filter_by(status=status)

    items = query.order_by(
        Testimonial.created_at.desc()
    ).all()

    return jsonify({
        "status": "success",
        "testimonials": [testimonial_data(item) for item in items],
        "total": len(items)
    }), 200


# ADMIN: Approve or reject a testimonial.
@testimonials_bp.route("/admin/<int:testimonial_id>/decision", methods=["PATCH"])
@admin_required()
def decide_testimonial(testimonial_id):
    data = request.get_json(silent=True) or {}
    decision = (data.get("status") or "").strip()

    if decision not in ["Approved", "Rejected"]:
        return jsonify({
            "status": "error",
            "message": "Choose Approved or Rejected."
        }), 400

    item = db.session.get(Testimonial, testimonial_id)

    if not item:
        return jsonify({
            "status": "error",
            "message": "Testimonial not found."
        }), 404

    try:
        item.status = decision
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": f"Testimonial {decision.lower()} successfully.",
            "testimonial": testimonial_data(item)
        }), 200

    except Exception:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Unable to update testimonial. Please try again."
        }), 500
