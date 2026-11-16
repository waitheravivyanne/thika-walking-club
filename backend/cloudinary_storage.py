import os
import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url


def configure_cloudinary():
    """Configure Cloudinary using environment variables."""

    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = os.getenv("CLOUDINARY_API_KEY")
    api_secret = os.getenv("CLOUDINARY_API_SECRET")

    if not all([cloud_name, api_key, api_secret]):
        raise RuntimeError(
            "Cloudinary configuration is missing. "
            "Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY "
            "and CLOUDINARY_API_SECRET."
        )

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True
    )


def upload_image(file, folder, public_id=None):
    """Upload an image to Cloudinary."""

    configure_cloudinary()

    result = cloudinary.uploader.upload(
        file,
        folder=folder,
        public_id=public_id,
        resource_type="image",
        overwrite=False
    )

    return {
        "public_id": result["public_id"],
        "secure_url": result["secure_url"]
    }


def delete_image(public_id):
    """Delete an image from Cloudinary."""

    if not public_id:
        return None

    configure_cloudinary()

    if public_id.startswith(CLOUDINARY_PREFIX):
        public_id = public_id[len(CLOUDINARY_PREFIX):]

    return cloudinary.uploader.destroy(
        public_id,
        resource_type="image",
        invalidate=True
    )

CLOUDINARY_PREFIX = "cloudinary:"


def is_cloudinary_image(value):
    """Check whether a stored value identifies a Cloudinary image."""
    return bool(value and value.startswith(CLOUDINARY_PREFIX))


def cloudinary_image_url(value):
    """Return a Cloudinary delivery URL for a stored public ID."""
    if not is_cloudinary_image(value):
        return None

    public_id = value[len(CLOUDINARY_PREFIX):]

    return cloudinary_url(
        public_id,
        secure=True
    )[0]
