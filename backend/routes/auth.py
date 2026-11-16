from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required
)
from werkzeug.security import check_password_hash
from sqlalchemy.exc import SQLAlchemyError

from models import Member
from extensions import db

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json(silent=True) or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({
            "message": "Email and password are required.",
            "status": "error"
        }), 400

    member = Member.query.filter_by(email=email).first()

    if (
        not member
        or not member.is_active
        or not check_password_hash(member.password_hash, password)
    ):
        return jsonify({
            "message": "Invalid email or password.",
            "status": "error"
        }), 401

    access_token = create_access_token(
        identity=str(member.id),
        additional_claims={
            "role": member.role
        }
    )

    return jsonify({
        "message": "Login successful!",
        "status": "success",
        "access_token": access_token,
        "member": {
            "id": member.id,
            "full_name": member.full_name,
            "email": member.email,
            "role": member.role
        }
    }), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def current_member():

    member_id = get_jwt_identity()

    member = Member.query.filter_by(id=member_id).first()

    if not member or not member.is_active:
        return jsonify({
            "status": "error",
            "message": "Member account not found or inactive."
        }), 404

    return jsonify({
        "status": "success",
        "member": {
            "id": member.id,
            "full_name": member.full_name,
            "email": member.email,
            "phone": member.phone,
            "role": member.role,
            "created_at": (
                member.created_at.isoformat()
                if member.created_at else None
            )
        }
    }), 200


@auth_bp.route("/me", methods=["PUT"])
@jwt_required()
def update_current_member():

    member_id = get_jwt_identity()

    member = Member.query.filter_by(id=member_id).first()

    if not member or not member.is_active:
        return jsonify({
            "status": "error",
            "message": "Member account not found or inactive."
        }), 404

    data = request.get_json(silent=True) or {}

    full_name = data.get("full_name")
    phone = data.get("phone")

    if not isinstance(full_name, str) or not isinstance(phone, str):
        return jsonify({
            "status": "error",
            "message": "Full name and phone number are required."
        }), 400

    full_name = full_name.strip()
    phone = phone.strip()

    if not full_name or not phone:
        return jsonify({
            "status": "error",
            "message": "Full name and phone number cannot be empty."
        }), 400

    if len(full_name) > 120 or len(phone) > 20:
        return jsonify({
            "status": "error",
            "message": "Full name or phone number is too long."
        }), 400

    member.full_name = full_name
    member.phone = phone

    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Unable to update your profile. Please try again."
        }), 500

    return jsonify({
        "status": "success",
        "message": "Your profile has been updated successfully.",
        "member": {
            "id": member.id,
            "full_name": member.full_name,
            "email": member.email,
            "phone": member.phone,
            "role": member.role,
            "created_at": (
                member.created_at.isoformat()
                if member.created_at else None
            )
        }
    }), 200
