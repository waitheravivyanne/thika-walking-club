from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from extensions import db
from models import Member

membership_bp = Blueprint("membership", __name__)


@membership_bp.route("/register", methods=["POST"])
def register_member():
    data = request.get_json(silent=True) or {}

    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    phone = (data.get("phone") or "").strip()
    password = data.get("password") or ""

    if not full_name or not email or not phone or not password:
        return jsonify({
            "status": "error",
            "message": "Full name, email, phone number and password are required."
        }), 400

    if len(full_name) > 120:
        return jsonify({
            "status": "error",
            "message": "Full name must not exceed 120 characters."
        }), 400

    if len(email) > 120 or "@" not in email or "." not in email.split("@")[-1]:
        return jsonify({
            "status": "error",
            "message": "Please provide a valid email address."
        }), 400

    if len(phone) > 20:
        return jsonify({
            "status": "error",
            "message": "Phone number must not exceed 20 characters."
        }), 400

    if len(password) < 8:
        return jsonify({
            "status": "error",
            "message": "Password must contain at least 8 characters."
        }), 400

    if len(password) > 128:
        return jsonify({
            "status": "error",
            "message": "Password is too long."
        }), 400

    existing_member = Member.query.filter_by(email=email).first()

    if existing_member:
        return jsonify({
            "status": "error",
            "message": "An account with this email address already exists. Please log in."
        }), 409

    member = Member(
        full_name=full_name,
        email=email,
        phone=phone,
        password_hash=generate_password_hash(password),
        role="member",
        is_active=True,
        activation_token_hash=None,
        activation_expires_at=None
    )

    try:
        db.session.add(member)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Your Thika Walking Club account has been created successfully. You can now log in.",
            "member": {
                "id": member.id,
                "full_name": member.full_name,
                "email": member.email,
                "phone": member.phone,
                "role": member.role
            }
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "An account with this email address already exists."
        }), 409

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Unable to create your account. Please try again."
        }), 500
