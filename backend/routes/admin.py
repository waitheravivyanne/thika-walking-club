import secrets
import hashlib
import os
from datetime import datetime, timezone, timedelta
from html import escape

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity
from werkzeug.security import generate_password_hash
from sqlalchemy.exc import SQLAlchemyError

from extensions import db
from models import (
    MembershipApplication,
    Member,
    EventRegistration,
    Testimonial,
    MerchandiseOrder
)
from auth_utils import admin_required
from email_service import send_email

admin_bp = Blueprint("admin", __name__)


def prepare_activation(member):
    token = secrets.token_urlsafe(32)

    member.activation_token_hash = hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()

    member.activation_expires_at = (
        datetime.now(timezone.utc) + timedelta(hours=24)
    )

    return token


def send_activation_email(member, token):
    frontend_url = os.getenv("FRONTEND_URL", "").rstrip("/")

    if not frontend_url:
        return False

    activation_link = f"{frontend_url}/activate?token={token}"
    safe_name = escape(member.full_name)

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #222;">
        <h2 style="color: #005C24;">Welcome to Thika Walking Club!</h2>
        <p>Hello {safe_name},</p>
        <p>Your membership application has been approved.</p>
        <p>Create your password using the button below:</p>
        <p>
          <a href="{activation_link}"
             style="display:inline-block;background:#008C32;color:white;
                    padding:12px 22px;text-decoration:none;border-radius:5px;">
            ACTIVATE MY ACCOUNT
          </a>
        </p>
        <p>This link expires in 24 hours and can only be used once.</p>
        <p>Regards,<br>Thika Walking Club</p>
      </body>
    </html>
    """

    try:
        return send_email(
            recipient=member.email,
            subject="Your Thika Walking Club Membership Is Approved",
            html_content=html_content
        )
    except Exception:
        return False


@admin_bp.route("/applications", methods=["GET"])
@admin_required()
def get_applications():

    applications = MembershipApplication.query.order_by(
        MembershipApplication.created_at.desc()
    ).all()

    results = []

    for application in applications:
        results.append({
            "id": application.id,
            "full_name": application.full_name,
            "email": application.email,
            "phone": application.phone,
            "location": application.location,
            "message": application.message,
            "status": application.status,
            "created_at": application.created_at.isoformat()
        })

    return jsonify({
        "applications": results,
        "status": "success"
    }), 200


@admin_bp.route(
    "/applications/<int:application_id>/decision",
    methods=["POST"]
)
@admin_required()
def decide_application(application_id):

    data = request.get_json(silent=True) or {}
    decision = (data.get("decision") or "").strip().lower()

    if decision not in ["approve", "reject"]:
        return jsonify({
            "message": "Decision must be approve or reject.",
            "status": "error"
        }), 400

    application = db.session.get(
        MembershipApplication,
        application_id
    )

    if not application:
        return jsonify({
            "message": "Application not found.",
            "status": "error"
        }), 404

    if application.status != "Pending":
        return jsonify({
            "message": "This application has already been reviewed.",
            "status": "error"
        }), 409

    try:
        if decision == "reject":
            application.status = "Rejected"
            db.session.commit()

            return jsonify({
                "message": "Application rejected successfully.",
                "status": "success",
                "application_id": application.id,
                "decision": application.status
            }), 200

        existing_member = Member.query.filter_by(
            email=application.email
        ).first()

        if existing_member:
            return jsonify({
                "message": "A member account already exists for this email address.",
                "status": "error"
            }), 409

        temporary_secret = secrets.token_urlsafe(48)

        new_member = Member(
            full_name=application.full_name,
            email=application.email,
            phone=application.phone,
            password_hash=generate_password_hash(temporary_secret),
            role="member",
            is_active=False
        )

        token = prepare_activation(new_member)

        db.session.add(new_member)
        application.status = "Approved"
        db.session.commit()

        email_sent = send_activation_email(new_member, token)

        return jsonify({
            "message": (
                "Application approved and activation email sent."
                if email_sent else
                "Application approved, but the activation email could not be sent. Please resend it."
            ),
            "status": "success",
            "application_id": application.id,
            "decision": application.status,
            "activation_email_sent": bool(email_sent)
        }), 200

    except Exception:
        db.session.rollback()

        return jsonify({
            "message": "Unable to process the application.",
            "status": "error"
        }), 500


@admin_bp.route(
    "/applications/<int:application_id>/resend-activation",
    methods=["POST"]
)
@admin_required()
def resend_activation(application_id):

    application = db.session.get(
        MembershipApplication,
        application_id
    )

    if not application:
        return jsonify({
            "message": "Application not found.",
            "status": "error"
        }), 404

    if application.status != "Approved":
        return jsonify({
            "message": "Only approved applications can receive activation emails.",
            "status": "error"
        }), 409

    member = Member.query.filter_by(
        email=application.email
    ).first()

    if not member:
        return jsonify({
            "message": "Member account not found.",
            "status": "error"
        }), 404

    if member.is_active:
        return jsonify({
            "message": "This member account is already active.",
            "status": "error"
        }), 409

    try:
        token = prepare_activation(member)
        db.session.commit()

        email_sent = send_activation_email(member, token)

        if not email_sent:
            return jsonify({
                "message": "Activation email could not be sent. Please try again.",
                "status": "error",
                "activation_email_sent": False
            }), 503

        return jsonify({
            "message": "Activation email resent successfully.",
            "status": "success",
            "activation_email_sent": True
        }), 200

    except Exception:
        db.session.rollback()

        return jsonify({
            "message": "Unable to resend the activation email.",
            "status": "error"
        }), 500

@admin_bp.route("/members", methods=["GET"])
@admin_required()
def get_members():

    members = Member.query.filter_by(
        role="member"
    ).order_by(
        Member.created_at.desc()
    ).all()

    results = []

    for member in members:
        results.append({
            "id": member.id,
            "full_name": member.full_name,
            "email": member.email,
            "phone": member.phone,
            "role": member.role,
            "is_active": member.is_active,
            "created_at": (
                member.created_at.isoformat()
                if member.created_at else None
            )
        })

    return jsonify({
        "members": results,
        "total": len(results),
        "status": "success"
    }), 200


@admin_bp.route(
    "/applications/<int:application_id>",
    methods=["DELETE"]
)
@admin_required()
def delete_application(application_id):
    application = db.session.get(
        MembershipApplication,
        application_id
    )

    if not application:
        return jsonify({
            "status": "error",
            "message": "Application not found."
        }), 404

    if application.status == "Approved":
        return jsonify({
            "status": "error",
            "message": (
                "Approved applications cannot be deleted here. "
                "Manage the member account separately."
            )
        }), 409

    try:
        db.session.delete(application)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Membership application deleted successfully."
        }), 200

    except Exception:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Unable to delete this application."
        }), 500

@admin_bp.route("/members/<int:member_id>", methods=["DELETE"])
@admin_required()
def delete_member(member_id):
    member = db.session.get(Member, member_id)

    if not member:
        return jsonify({
            "status": "error",
            "message": "Member account not found."
        }), 404

    # Never allow this endpoint to delete an administrator.
    if member.role != "member":
        return jsonify({
            "status": "error",
            "message": "Administrator accounts cannot be deleted here."
        }), 403

    current_user_id = str(get_jwt_identity())

    if current_user_id == str(member.id):
        return jsonify({
            "status": "error",
            "message": "You cannot delete your own account."
        }), 403

    try:
        # Preserve historical records while removing their account link.
        EventRegistration.query.filter_by(
            member_id=member.id
        ).update(
            {EventRegistration.member_id: None},
            synchronize_session=False
        )

        Testimonial.query.filter_by(
            member_id=member.id
        ).update(
            {Testimonial.member_id: None},
            synchronize_session=False
        )

        MerchandiseOrder.query.filter_by(
            member_id=member.id
        ).update(
            {MerchandiseOrder.member_id: None},
            synchronize_session=False
        )

        db.session.delete(member)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": (
                "Member account permanently deleted. "
                "Historical event, testimonial and merchandise "
                "records have been preserved."
            )
        }), 200

    except SQLAlchemyError:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Unable to delete this member account. Please try again."
        }), 500
