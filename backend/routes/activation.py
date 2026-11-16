import hashlib
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash

from extensions import db
from models import Member

activation_bp = Blueprint("activation", __name__)


@activation_bp.route("/activate", methods=["POST"])
def activate_member():

    data = request.get_json(silent=True) or {}

    token = (data.get("token") or "").strip()
    password = data.get("password") or ""
    confirm_password = data.get("confirm_password") or ""

    if not token or not password or not confirm_password:
        return jsonify({
            "status": "error",
            "message": "Token, password and password confirmation are required."
        }), 400

    if len(password) < 12:
        return jsonify({
            "status": "error",
            "message": "Your password must contain at least 12 characters."
        }), 400

    if password != confirm_password:
        return jsonify({
            "status": "error",
            "message": "The passwords do not match."
        }), 400

    token_hash = hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()

    member = Member.query.filter_by(
        activation_token_hash=token_hash
    ).first()

    if not member:
        return jsonify({
            "status": "error",
            "message": "This activation link is invalid or has already been used."
        }), 400

    if member.is_active:
        return jsonify({
            "status": "error",
            "message": "This account has already been activated."
        }), 409

    expiry = member.activation_expires_at

    if not expiry:
        return jsonify({
            "status": "error",
            "message": "This activation link is invalid or has expired."
        }), 400

    # Handle databases that return timezone-naive timestamps.
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)

    if expiry <= datetime.now(timezone.utc):
        return jsonify({
            "status": "error",
            "message": "This activation link has expired. Please request a new one."
        }), 400

    try:
        member.password_hash = generate_password_hash(password)
        member.is_active = True
        member.activation_token_hash = None
        member.activation_expires_at = None

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Your Thika Walking Club account has been activated. You can now log in."
        }), 200

    except Exception:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Unable to activate your account. Please try again."
        }), 500
