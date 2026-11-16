import os
import json

from flask import Blueprint, jsonify, request, send_from_directory, current_app, redirect
from werkzeug.utils import secure_filename
from sqlalchemy.exc import SQLAlchemyError

from extensions import db
from models import WebsitePhoto
from auth_utils import admin_required
from cloudinary_storage import (
    upload_image,
    delete_image,
    is_cloudinary_image,
    cloudinary_image_url
)



photos_bp = Blueprint("photos", __name__)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_FILE_SIZE = 8 * 1024 * 1024

ALLOWED_PLACEMENTS = {
    "homepage",
    "gallery",
    "activities",
    "events",
    "partnerships"
}


def upload_folder():
    folder = os.path.join(
        current_app.root_path,
        "uploads",
        "photos"
    )
    os.makedirs(folder, exist_ok=True)
    return folder


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def serialize_photo(photo):
    cloudinary_url = cloudinary_image_url(photo.filename)

    return {
        "id": photo.id,
        "filename": photo.filename,
        "original_filename": photo.original_filename,
        "url": cloudinary_url or f"/api/photos/image/{photo.filename}",
        "caption": photo.caption,
        "description": photo.description,
        "placements": photo.placements or [],
        "is_published": photo.is_published,
        "created_at": photo.created_at.isoformat() if photo.created_at else None,
        "updated_at": photo.updated_at.isoformat() if photo.updated_at else None
    }


def save_photo_file(file):
    if not file or not file.filename:
        return None, "Please select a photo."

    original_name = secure_filename(file.filename)

    if not original_name or not allowed_file(original_name):
        return None, "Only JPG, JPEG, PNG and WEBP images are allowed."

    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)

    if file_size > MAX_FILE_SIZE:
        return None, "The photo must not exceed 8 MB."

    try:
        uploaded = upload_image(
            file,
            folder="thika-walking-club/photos"
        )

        return {
            "filename": f"cloudinary:{uploaded['public_id']}",
            "original_filename": original_name
        }, None

    except Exception:
        current_app.logger.exception("Cloudinary photo upload failed.")

        return None, "Unable to upload the photo. Please try again."


def remove_photo_file(filename):
    if not filename:
        return

    if is_cloudinary_image(filename):
        public_id = filename[len("cloudinary:"):]
        delete_image(public_id)
        return

    path = os.path.join(upload_folder(), filename)

    if os.path.isfile(path):
        os.remove(path)


def parse_placements(value):
    if isinstance(value, str):
        try:
            value = json.loads(value)
        except (TypeError, ValueError):
            return None

    if not isinstance(value, list):
        return None

    if any(not isinstance(item, str) for item in value):
        return None

    placements = list(dict.fromkeys(value))

    if not placements or any(
        item not in ALLOWED_PLACEMENTS for item in placements
    ):
        return None

    return placements


@photos_bp.route("/", methods=["GET"])
def public_photos():
    placement = request.args.get("placement")

    if placement and placement not in ALLOWED_PLACEMENTS:
        return jsonify({
            "status": "error",
            "message": "Invalid photo placement."
        }), 400

    photos = WebsitePhoto.query.filter_by(
        is_published=True
    ).order_by(WebsitePhoto.created_at.desc()).all()

    if placement:
        photos = [
            photo for photo in photos
            if placement in (photo.placements or [])
        ]

    return jsonify({
        "status": "success",
        "photos": [serialize_photo(photo) for photo in photos]
    }), 200


@photos_bp.route("/admin", methods=["GET"])
@admin_required()
def admin_photos():
    photos = WebsitePhoto.query.order_by(
        WebsitePhoto.created_at.desc()
    ).all()

    return jsonify({
        "status": "success",
        "photos": [serialize_photo(photo) for photo in photos]
    }), 200


@photos_bp.route("/", methods=["POST"])
@admin_required()
def upload_photo():
    saved, error = save_photo_file(request.files.get("photo"))

    if error:
        return jsonify({
            "status": "error",
            "message": error
        }), 400

    placements = parse_placements(request.form.get("placements"))

    if placements is None:
        remove_photo_file(saved["filename"])
        return jsonify({
            "status": "error",
            "message": "Choose at least one valid website section."
        }), 400

    published_value = request.form.get("is_published", "true").lower()

    if published_value not in {"true", "false"}:
        remove_photo_file(saved["filename"])
        return jsonify({
            "status": "error",
            "message": "Invalid publication status."
        }), 400

    photo = WebsitePhoto(
        filename=saved["filename"],
        original_filename=saved["original_filename"],
        caption=request.form.get("caption", "").strip()[:200] or None,
        description=request.form.get("description", "").strip() or None,
        placements=placements,
        is_published=published_value == "true"
    )

    try:
        db.session.add(photo)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Photo uploaded successfully.",
            "photo": serialize_photo(photo)
        }), 201

    except SQLAlchemyError:
        db.session.rollback()
        remove_photo_file(saved["filename"])

        return jsonify({
            "status": "error",
            "message": "Unable to save the photo."
        }), 500


@photos_bp.route("/<int:photo_id>", methods=["PUT"])
@admin_required()
def update_photo(photo_id):
    photo = db.session.get(WebsitePhoto, photo_id)

    if not photo:
        return jsonify({
            "status": "error",
            "message": "Photo not found."
        }), 404

    data = request.get_json(silent=True) or {}

    if "caption" in data:
        caption = data["caption"]

        if caption is not None and not isinstance(caption, str):
            return jsonify({"status": "error", "message": "Invalid caption."}), 400

        photo.caption = caption.strip()[:200] or None if caption else None

    if "description" in data:
        description = data["description"]

        if description is not None and not isinstance(description, str):
            return jsonify({"status": "error", "message": "Invalid description."}), 400

        photo.description = description.strip() or None if description else None

    if "placements" in data:
        placements = parse_placements(data["placements"])

        if placements is None:
            return jsonify({
                "status": "error",
                "message": "Choose at least one valid website section."
            }), 400

        photo.placements = placements

    if "is_published" in data:
        if not isinstance(data["is_published"], bool):
            return jsonify({
                "status": "error",
                "message": "Invalid publication status."
            }), 400

        photo.is_published = data["is_published"]

    try:
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Photo updated successfully.",
            "photo": serialize_photo(photo)
        }), 200

    except SQLAlchemyError:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Unable to update the photo."
        }), 500


@photos_bp.route("/<int:photo_id>/replace", methods=["POST"])
@admin_required()
def replace_photo(photo_id):
    photo = db.session.get(WebsitePhoto, photo_id)

    if not photo:
        return jsonify({
            "status": "error",
            "message": "Photo not found."
        }), 404

    saved, error = save_photo_file(request.files.get("photo"))

    if error:
        return jsonify({
            "status": "error",
            "message": error
        }), 400

    old_filename = photo.filename
    old_original_filename = photo.original_filename

    photo.filename = saved["filename"]
    photo.original_filename = saved["original_filename"]

    try:
        db.session.commit()
        remove_photo_file(old_filename)

        return jsonify({
            "status": "success",
            "message": "Photo replaced successfully.",
            "photo": serialize_photo(photo)
        }), 200

    except SQLAlchemyError:
        db.session.rollback()
        remove_photo_file(saved["filename"])
        photo.filename = old_filename
        photo.original_filename = old_original_filename

        return jsonify({
            "status": "error",
            "message": "Unable to replace the photo."
        }), 500


@photos_bp.route("/<int:photo_id>", methods=["DELETE"])
@admin_required()
def delete_photo(photo_id):
    photo = db.session.get(WebsitePhoto, photo_id)

    if not photo:
        return jsonify({
            "status": "error",
            "message": "Photo not found."
        }), 404

    filename = photo.filename

    try:
        db.session.delete(photo)
        db.session.commit()
        remove_photo_file(filename)

        return jsonify({
            "status": "success",
            "message": "Photo deleted successfully."
        }), 200

    except SQLAlchemyError:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Unable to delete the photo."
        }), 500


@photos_bp.route("/image/<path:filename>", methods=["GET"])
def serve_photo(filename):
    if is_cloudinary_image(filename):
        image_url = cloudinary_image_url(filename)
        return redirect(image_url)

    return send_from_directory(upload_folder(), filename)
