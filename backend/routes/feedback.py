from flask import Blueprint, jsonify, request
from extensions import db
from models import Feedback
from auth_utils import admin_required

feedback_bp = Blueprint("feedback", __name__)


@feedback_bp.route("/", methods=["POST"])
def submit_feedback():
    data = request.get_json(silent=True) or {}

    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    subject = (data.get("subject") or "").strip()
    message = (data.get("message") or "").strip()

    if not all([full_name, email, subject, message]):
        return jsonify({
            "message": "Please complete all fields.",
            "status": "error"
        }), 400

    if len(full_name) > 120 or len(email) > 120:
        return jsonify({
            "message": "Name or email is too long.",
            "status": "error"
        }), 400

    if len(subject) > 200 or len(message) > 10000:
        return jsonify({
            "message": "Subject or message is too long.",
            "status": "error"
        }), 400

    feedback = Feedback(
        full_name=full_name,
        email=email,
        subject=subject,
        message=message
    )

    try:
        db.session.add(feedback)
        db.session.commit()

        return jsonify({
            "message": "Your message has been sent successfully.",
            "status": "success"
        }), 201

    except Exception:
        db.session.rollback()
        return jsonify({
            "message": "Unable to send your message. Please try again.",
            "status": "error"
        }), 500


@feedback_bp.route("/", methods=["GET"])
@admin_required()
def get_feedback():
    messages = Feedback.query.order_by(
        Feedback.created_at.desc()
    ).all()

    results = [{
        "id": item.id,
        "full_name": item.full_name,
        "email": item.email,
        "subject": item.subject,
        "message": item.message,
        "status": item.status,
        "created_at": (
            item.created_at.isoformat()
            if item.created_at else None
        )
    } for item in messages]

    return jsonify({
        "feedback": results,
        "total": len(results),
        "new": sum(1 for item in messages if item.status == "New"),
        "status": "success"
    }), 200


@feedback_bp.route("/<int:feedback_id>/status", methods=["PATCH"])
@admin_required()
def update_feedback_status(feedback_id):
    data = request.get_json(silent=True) or {}
    new_status = (data.get("status") or "").strip()

    if new_status not in ["New", "Reviewed", "Resolved"]:
        return jsonify({
            "message": "Invalid feedback status.",
            "status": "error"
        }), 400

    item = db.session.get(Feedback, feedback_id)

    if not item:
        return jsonify({
            "message": "Feedback not found.",
            "status": "error"
        }), 404

    try:
        item.status = new_status
        db.session.commit()

        return jsonify({
            "message": "Feedback status updated.",
            "status": "success"
        }), 200

    except Exception:
        db.session.rollback()
        return jsonify({
            "message": "Unable to update feedback.",
            "status": "error"
        }), 500
