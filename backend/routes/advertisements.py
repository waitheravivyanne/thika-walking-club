
import os
from datetime import date
from urllib.parse import urlparse

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.utils import secure_filename

from extensions import db
from models import Advertisement
from auth_utils import admin_required
from cloudinary_storage import upload_image, delete_image


advertisements_bp = Blueprint("advertisements", __name__)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_FILE_SIZE = 8 * 1024 * 1024


def valid_destination_url(value):
    if not isinstance(value, str):
        return False

    parsed = urlparse(value.strip())

    return (
        parsed.scheme in {"http", "https"}
        and bool(parsed.netloc)
        and not any(char.isspace() for char in value)
    )


def save_advertisement_image(file):
    if not file or not file.filename:
        return None, "Please select an advert banner."

    filename = secure_filename(file.filename)

    if (
        not filename
        or "." not in filename
        or filename.rsplit(".", 1)[1].lower() not in ALLOWED_EXTENSIONS
    ):
        return None, "Only JPG, JPEG, PNG and WEBP images are allowed."

    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)

    if size > MAX_FILE_SIZE:
        return None, "The banner must not exceed 8 MB."

    try:
        uploaded = upload_image(
            file,
            folder="thika-walking-club/advertisements"
        )

        return {
            "image": f"cloudinary:{uploaded['public_id']}",
            "original_filename": filename
        }, None

    except Exception:
        from flask import current_app
        current_app.logger.exception("Advertisement image upload failed.")
        return None, "Unable to upload the banner. Please try again."


def serialize_advertisement(ad):
    """Public advert information only."""
    from cloudinary_storage import cloudinary_image_url

    return {
        "id": ad.id,
        "advertiser_name": ad.advertiser_name,
        "business_name": ad.business_name,
        "headline": ad.headline,
        "description": ad.description,
        "image": cloudinary_image_url(ad.image) if ad.image else None,
        "destination_url": ad.destination_url,
        "start_date": ad.start_date.isoformat() if ad.start_date else None,
        "end_date": ad.end_date.isoformat() if ad.end_date else None,
        "advertising_fee": (
            float(ad.advertising_fee)
            if ad.advertising_fee is not None else None
        ),
        "payment_status": ad.payment_status,
        "approval_status": ad.approval_status,
        "is_active": ad.is_active,
        "created_at": ad.created_at.isoformat() if ad.created_at else None
    }


def serialize_admin_advertisement(ad):
    """Private admin information, including payment and contact details."""
    advertisement = serialize_advertisement(ad)

    advertisement.update({
        "email": ad.email,
        "phone": ad.phone,
        "mpesa_transaction_code": ad.mpesa_transaction_code,
        "original_filename": ad.original_filename
    })

    return advertisement


@advertisements_bp.route("/", methods=["POST"])
def submit_advertisement():
    data = request.form

    required_fields = [
        "advertiser_name",
        "email",
        "phone",
        "headline",
        "destination_url",
        "mpesa_transaction_code"
    ]

    missing = [
        field for field in required_fields
        if not data.get(field, "").strip()
    ]

    if missing:
        return jsonify({
            "status": "error",
            "message": "Please complete all required fields.",
            "missing_fields": missing
        }), 400

    if not valid_destination_url(data.get("destination_url", "").strip()):
        return jsonify({
            "status": "error",
            "message": (
                "Please provide a valid website link starting with "
                "https:// or http://."
            )
        }), 400

    transaction_code = data["mpesa_transaction_code"].strip().upper()

    if len(transaction_code) > 40:
        return jsonify({
            "status": "error",
            "message": "Invalid M-Pesa transaction code."
        }), 400

    saved, error = save_advertisement_image(request.files.get("image"))

    if error:
        return jsonify({
            "status": "error",
            "message": error
        }), 400

    ad = Advertisement(
        advertiser_name=data["advertiser_name"].strip()[:150],
        business_name=data.get("business_name", "").strip()[:150] or None,
        email=data["email"].strip()[:120],
        phone=data["phone"].strip()[:20],
        headline=data["headline"].strip()[:200],
        description=data.get("description", "").strip() or None,
        image=saved["image"],
        original_filename=saved["original_filename"],
        destination_url=data["destination_url"].strip(),
        mpesa_transaction_code=transaction_code,
        payment_status="Pending",
        approval_status="Pending",
        is_active=False
    )

    try:
        db.session.add(ad)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": (
                "Your advert has been submitted. Payment will be "
                "verified by the TWC team before publication."
            ),
            "advertisement": {
                "id": ad.id,
                "headline": ad.headline,
                "payment_status": ad.payment_status,
                "approval_status": ad.approval_status
            }
        }), 201

    except SQLAlchemyError:
        db.session.rollback()

        from flask import current_app
        current_app.logger.exception("Advertisement submission failed.")

        try:
            delete_image(saved["image"].replace("cloudinary:", "", 1))
        except Exception:
            current_app.logger.exception(
                "Advertisement image cleanup failed."
            )

        return jsonify({
            "status": "error",
            "message": "Unable to submit your advert. Please try again."
        }), 500


@advertisements_bp.route("/", methods=["GET"])
def public_advertisements():
    today = date.today()

    adverts = Advertisement.query.filter(
        Advertisement.payment_status == "Verified",
        Advertisement.approval_status == "Approved",
        Advertisement.is_active.is_(True),
        db.or_(
            Advertisement.start_date.is_(None),
            Advertisement.start_date <= today
        ),
        db.or_(
            Advertisement.end_date.is_(None),
            Advertisement.end_date >= today
        )
    ).order_by(Advertisement.created_at.desc()).all()

    return jsonify({
        "status": "success",
        "advertisements": [
            serialize_advertisement(ad) for ad in adverts
        ]
    }), 200


@advertisements_bp.route("/admin", methods=["GET"])
@admin_required()
def admin_advertisements():
    adverts = Advertisement.query.order_by(
        Advertisement.created_at.desc()
    ).all()

    return jsonify({
        "status": "success",
        "advertisements": [
            serialize_admin_advertisement(ad) for ad in adverts
        ]
    }), 200


@advertisements_bp.route("/admin/<int:advertisement_id>", methods=["PATCH"])
@admin_required()
def update_advertisement(advertisement_id):
    ad = db.session.get(Advertisement, advertisement_id)

    if not ad:
        return jsonify({
            "status": "error",
            "message": "Advertisement not found."
        }), 404

    data = request.get_json(silent=True) or {}

    if "payment_status" in data:
        if data["payment_status"] not in {
            "Pending", "Verified", "Rejected"
        }:
            return jsonify({
                "status": "error",
                "message": "Invalid payment status."
            }), 400

        ad.payment_status = data["payment_status"]

    if "approval_status" in data:
        if data["approval_status"] not in {
            "Pending", "Approved", "Rejected"
        }:
            return jsonify({
                "status": "error",
                "message": "Invalid approval status."
            }), 400

        ad.approval_status = data["approval_status"]

    if "is_active" in data:
        if not isinstance(data["is_active"], bool):
            return jsonify({
                "status": "error",
                "message": "Invalid active status."
            }), 400

        ad.is_active = data["is_active"]

    if "start_date" in data:
        try:
            ad.start_date = (
                date.fromisoformat(data["start_date"])
                if data["start_date"] else None
            )
        except (TypeError, ValueError):
            return jsonify({
                "status": "error",
                "message": "Invalid start date."
            }), 400

    if "end_date" in data:
        try:
            ad.end_date = (
                date.fromisoformat(data["end_date"])
                if data["end_date"] else None
            )
        except (TypeError, ValueError):
            return jsonify({
                "status": "error",
                "message": "Invalid end date."
            }), 400

    if (
        ad.start_date
        and ad.end_date
        and ad.end_date < ad.start_date
    ):
        return jsonify({
            "status": "error",
            "message": "The end date cannot be earlier than the start date."
        }), 400

    try:
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Advertisement updated successfully.",
            "advertisement": serialize_admin_advertisement(ad)
        }), 200

    except SQLAlchemyError:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Unable to update advertisement."
        }), 500


@advertisements_bp.route(
    "/admin/<int:advertisement_id>",
    methods=["DELETE"]
)
@admin_required()
def delete_advertisement(advertisement_id):
    from flask import current_app

    ad = db.session.get(Advertisement, advertisement_id)

    if not ad:
        return jsonify({
            "status": "error",
            "message": "Advertisement not found."
        }), 404

    image_to_delete = ad.image

    try:
        db.session.delete(ad)
        db.session.commit()

    except SQLAlchemyError:
        db.session.rollback()

        current_app.logger.exception(
            "Advertisement deletion failed."
        )

        return jsonify({
            "status": "error",
            "message": "Unable to delete advertisement."
        }), 500

    # Delete the Cloudinary image after the database deletion succeeds.
    # Image cleanup failure must not undo the successful database deletion.
    if image_to_delete and image_to_delete.startswith("cloudinary:"):
        public_id = image_to_delete.replace("cloudinary:", "", 1)

        try:
            delete_image(public_id)

        except Exception:
            current_app.logger.exception(
                "Advertisement was deleted, but its Cloudinary image "
                "could not be deleted."
            )

            return jsonify({
                "status": "success",
                "message": (
                    "Advertisement deleted, but its image could not "
                    "be removed from Cloudinary."
                )
            }), 200

    return jsonify({
        "status": "success",
        "message": "Advertisement deleted successfully."
    }), 200
