import os
import uuid
from decimal import Decimal, InvalidOperation

from flask import (
    Blueprint,
    jsonify,
    request,
    send_from_directory,
    current_app
)
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from sqlalchemy.exc import SQLAlchemyError

from extensions import db
from models import (
    Member,
    MerchandiseProduct,
    MerchandiseVariant,
    MerchandiseOrder,
    MerchandiseOrderItem
)
from auth_utils import admin_required


merchandise_bp = Blueprint("merchandise", __name__)

ALLOWED_SIZES = {"XS", "S", "M", "L", "XL", "XXL"}
ALLOWED_COLOURS = {"Black", "White"}
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_FILE_SIZE = 8 * 1024 * 1024


def upload_folder():
    folder = os.path.join(
        current_app.root_path,
        "uploads",
        "merchandise"
    )
    os.makedirs(folder, exist_ok=True)
    return folder


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def get_active_member():
    member_id = get_jwt_identity()
    member = db.session.get(Member, int(member_id))

    if not member or not member.is_active:
        return None

    return member


def serialize_variant(variant):
    return {
        "id": variant.id,
        "size": variant.size,
        "colour": variant.colour,
        "stock_quantity": variant.stock_quantity
    }


def serialize_product(product):
    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": float(product.price),
        "image_url": product.image_url,
        "is_published": product.is_published,
        "variants": [
            serialize_variant(variant)
            for variant in product.variants
        ],
        "created_at": (
            product.created_at.isoformat()
            if product.created_at else None
        )
    }
@merchandise_bp.route("/products", methods=["GET"])
def public_products():
    products = MerchandiseProduct.query.filter_by(
        is_published=True
    ).order_by(MerchandiseProduct.created_at.desc()).all()

    return jsonify({
        "status": "success",
        "products": [serialize_product(p) for p in products]
    }), 200


@merchandise_bp.route("/products/<int:product_id>", methods=["GET"])
def public_product_detail(product_id):
    product = MerchandiseProduct.query.filter_by(
        id=product_id,
        is_published=True
    ).first()

    if not product:
        return jsonify({
            "status": "error",
            "message": "Product not found."
        }), 404

    return jsonify({
        "status": "success",
        "product": serialize_product(product)
    }), 200


@merchandise_bp.route("/payment-info", methods=["GET"])
def payment_info():
    return jsonify({
        "status": "success",
        "payment_method": "M-Pesa Till",
        "till_number": os.getenv("MPESA_TILL_NUMBER", "000000"),
        "is_demo": os.getenv("MPESA_TILL_DUMMY", "true").lower() == "true",
        "message": "DEMO ONLY: This is a placeholder Till Number. Do not send money to it."
    }), 200
@merchandise_bp.route("/admin/products", methods=["GET"])
@admin_required()
def admin_products():
    products = MerchandiseProduct.query.order_by(
        MerchandiseProduct.created_at.desc()
    ).all()

    return jsonify({
        "status": "success",
        "products": [serialize_product(p) for p in products]
    }), 200
@merchandise_bp.route("/admin/products", methods=["POST"])
@admin_required()
def create_product():
    name = (request.form.get("name") or "").strip()
    description = (request.form.get("description") or "").strip()
    price_value = request.form.get("price")
    published = request.form.get("is_published", "false").lower() == "true"

    if not name or not price_value:
        return jsonify({
            "status": "error",
            "message": "Product name and price are required."
        }), 400

    try:
        price = Decimal(price_value)
        if not price.is_finite() or price <= 0:
            raise InvalidOperation
    except (InvalidOperation, ValueError):
        return jsonify({
            "status": "error",
            "message": "Enter a valid price greater than zero."
        }), 400

    image = request.files.get("image")
    image_url = None
    saved_path = None

    if image and image.filename:
        filename = secure_filename(image.filename)

        if not filename or not allowed_file(filename):
            return jsonify({
                "status": "error",
                "message": "Only JPG, JPEG, PNG and WEBP images are allowed."
            }), 400

        image.seek(0, os.SEEK_END)
        file_size = image.tell()
        image.seek(0)

        if file_size > MAX_FILE_SIZE:
            return jsonify({
                "status": "error",
                "message": "Image must not exceed 8 MB."
            }), 400

        extension = filename.rsplit(".", 1)[1].lower()
        unique_name = f"{uuid.uuid4().hex}.{extension}"
        saved_path = os.path.join(upload_folder(), unique_name)
        image.save(saved_path)
        image_url = f"/api/merchandise/image/{unique_name}"

    product = MerchandiseProduct(
        name=name,
        description=description,
        price=price,
        image_url=image_url,
        is_published=published
    )

    try:
        db.session.add(product)
        db.session.flush()

        for size in sorted(ALLOWED_SIZES):
            for colour in sorted(ALLOWED_COLOURS):
                stock_value = request.form.get(
                    f"stock_{size}_{colour}",
                    "0"
                )

                try:
                    stock = int(stock_value)
                    if stock < 0:
                        raise ValueError
                except (TypeError, ValueError):
                    db.session.rollback()
                    if saved_path and os.path.isfile(saved_path):
                        os.remove(saved_path)
                    return jsonify({
                        "status": "error",
                        "message": f"Invalid stock for {size} {colour}."
                    }), 400

                db.session.add(MerchandiseVariant(
                    product_id=product.id,
                    size=size,
                    colour=colour,
                    stock_quantity=stock
                ))

        db.session.commit()

    except SQLAlchemyError:
        current_app.logger.exception(
            "MERCHANDISE PRODUCT CREATION DATABASE ERROR"
        )
        db.session.rollback()
        if saved_path and os.path.isfile(saved_path):
            os.remove(saved_path)
        return jsonify({
            "status": "error",
            "message": "Could not save the product."
        }), 500

    return jsonify({
        "status": "success",
        "message": "Product created successfully.",
        "product": serialize_product(product)
    }), 201
@merchandise_bp.route("/image/<filename>", methods=["GET"])
def merchandise_image(filename):
    safe_name = secure_filename(filename)

    if not safe_name or safe_name != filename:
        return jsonify({
            "status": "error",
            "message": "Invalid image filename."
        }), 400

    return send_from_directory(upload_folder(), safe_name)

@merchandise_bp.route(
    "/admin/products/<int:product_id>",
    methods=["PUT"]
)
@admin_required()
def update_product(product_id):
    product = db.session.get(MerchandiseProduct, product_id)

    if not product:
        return jsonify({
            "status": "error",
            "message": "Product not found."
        }), 404

    name = request.form.get("name")
    description = request.form.get("description")
    price_value = request.form.get("price")
    published = request.form.get("is_published")

    if name is not None:
        name = name.strip()
        if not name:
            return jsonify({
                "status": "error",
                "message": "Product name cannot be empty."
            }), 400
        product.name = name

    if description is not None:
        product.description = description.strip()

    if price_value is not None:
        try:
            price = Decimal(price_value)
            if not price.is_finite() or price <= 0:
                raise InvalidOperation
            product.price = price
        except (InvalidOperation, ValueError):
            return jsonify({
                "status": "error",
                "message": "Invalid product price."
            }), 400

    if published is not None:
        product.is_published = published.lower() == "true"

    image = request.files.get("image")
    saved_path = None

    if image and image.filename:
        filename = secure_filename(image.filename)

        if not filename or not allowed_file(filename):
            return jsonify({
                "status": "error",
                "message": "Invalid image format."
            }), 400

        image.seek(0, os.SEEK_END)
        size = image.tell()
        image.seek(0)

        if size > MAX_FILE_SIZE:
            return jsonify({
                "status": "error",
                "message": "Image must not exceed 8 MB."
            }), 400

        extension = filename.rsplit(".", 1)[1].lower()
        unique_name = f"{uuid.uuid4().hex}.{extension}"
        saved_path = os.path.join(upload_folder(), unique_name)
        image.save(saved_path)
        product.image_url = f"/api/merchandise/image/{unique_name}"

    try:
        for size in ALLOWED_SIZES:
            for colour in ALLOWED_COLOURS:
                key = f"stock_{size}_{colour}"
                value = request.form.get(key)

                if value is None:
                    continue

                try:
                    quantity = int(value)
                    if quantity < 0:
                        raise ValueError
                except (TypeError, ValueError):
                    db.session.rollback()
                    if saved_path and os.path.isfile(saved_path):
                        os.remove(saved_path)
                    return jsonify({
                        "status": "error",
                        "message": f"Invalid stock for {size} {colour}."
                    }), 400

                variant = MerchandiseVariant.query.filter_by(
                    product_id=product.id,
                    size=size,
                    colour=colour
                ).first()

                if not variant:
                    variant = MerchandiseVariant(
                        product_id=product.id,
                        size=size,
                        colour=colour,
                        stock_quantity=quantity
                    )
                    db.session.add(variant)
                else:
                    variant.stock_quantity = quantity

        db.session.commit()

    except SQLAlchemyError:
        db.session.rollback()
        if saved_path and os.path.isfile(saved_path):
            os.remove(saved_path)
        return jsonify({
            "status": "error",
            "message": "Could not update the product."
        }), 500

    return jsonify({
        "status": "success",
        "message": "Product updated successfully.",
        "product": serialize_product(product)
    }), 200

@merchandise_bp.route(
    "/admin/products/<int:product_id>",
    methods=["DELETE"]
)
@admin_required()
def delete_product(product_id):
    product = db.session.get(MerchandiseProduct, product_id)

    if not product:
        return jsonify({
            "status": "error",
            "message": "Product not found."
        }), 404

    product.is_published = False

    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Could not unpublish the product."
        }), 500

    return jsonify({
        "status": "success",
        "message": "Product removed from the shop."
    }), 200

@merchandise_bp.route("/orders", methods=["POST"])
@jwt_required()
def place_order():
    member = get_active_member()

    if not member:
        return jsonify({
            "status": "error",
            "message": "An active member account is required."
        }), 403

    data = request.get_json(silent=True) or {}
    items = data.get("items")

    address = (data.get("delivery_address") or "").strip()
    phone = (data.get("delivery_phone") or "").strip()
    transaction_code = (
        data.get("mpesa_transaction_code") or ""
    ).strip().upper()

    if not isinstance(items, list) or not items:
        return jsonify({
            "status": "error",
            "message": "Your cart is empty."
        }), 400

    if not address or not phone or len(address) > 250 or len(phone) > 20:
        return jsonify({
            "status": "error",
            "message": "Enter a valid delivery address and phone number."
        }), 400

    if len(transaction_code) > 40:
        return jsonify({
            "status": "error",
            "message": "Invalid M-Pesa transaction reference."
        }), 400

    order = None

    try:
        order_items = []
        total = Decimal("0.00")

        for item in items:
            if not isinstance(item, dict):
                raise ValueError("Invalid cart item.")

            variant_id = item.get("variant_id")
            quantity = item.get("quantity")

            if (
                isinstance(variant_id, bool)
                or not isinstance(variant_id, int)
                or isinstance(quantity, bool)
                or not isinstance(quantity, int)
                or quantity < 1
                or quantity > 50
            ):
                raise ValueError("Invalid product quantity or variant.")

            variant = db.session.query(
                MerchandiseVariant
            ).filter_by(
                id=variant_id
            ).with_for_update().first()

            if not variant:
                raise ValueError("Selected product option was not found.")

            product = db.session.get(
                MerchandiseProduct,
                variant.product_id
            )

            if not product or not product.is_published:
                raise ValueError("A selected product is unavailable.")

            if variant.size not in ALLOWED_SIZES or variant.colour not in ALLOWED_COLOURS:
                raise ValueError("Invalid product option.")

            if variant.stock_quantity < quantity:
                raise ValueError(
                    f"Insufficient stock for {product.name}, "
                    f"{variant.size}, {variant.colour}."
                )

            variant.stock_quantity -= quantity

            unit_price = Decimal(str(product.price))
            total += unit_price * quantity

            order_items.append({
                "product_id": product.id,
                "variant_id": variant.id,
                "product_name": product.name,
                "size": variant.size,
                "colour": variant.colour,
                "unit_price": unit_price,
                "quantity": quantity
            })

        order = MerchandiseOrder(
            member_id=member.id,
            total_amount=total,
            status="Pending",
            payment_status="Verification Pending",
            payment_method="M-Pesa Till",
            mpesa_transaction_code=transaction_code or None,
            delivery_address=address,
            delivery_phone=phone
        )

        db.session.add(order)
        db.session.flush()

        for item in order_items:
            db.session.add(MerchandiseOrderItem(
                order_id=order.id,
                **item
            ))

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Order placed. Payment awaits admin verification.",
            "order": {
                "id": order.id,
                "total_amount": float(order.total_amount),
                "status": order.status,
                "payment_status": order.payment_status
            }
        }), 201

    except ValueError as error:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 400

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Could not place your order. Please try again."
        }), 500

@merchandise_bp.route("/admin/orders", methods=["GET"])
@admin_required()
def admin_orders():
    orders = MerchandiseOrder.query.order_by(
        MerchandiseOrder.created_at.desc()
    ).all()

    results = []

    for order in orders:
        results.append({
            "id": order.id,
            "member": {
                "id": order.member.id,
                "full_name": order.member.full_name,
                "email": order.member.email,
                "phone": order.member.phone
            },
            "items": [
                {
                    "product_name": item.product_name,
                    "size": item.size,
                    "colour": item.colour,
                    "quantity": item.quantity,
                    "unit_price": float(item.unit_price)
                }
                for item in order.items
            ],
            "total_amount": float(order.total_amount),
            "status": order.status,
            "payment_status": order.payment_status,
            "payment_method": order.payment_method,
            "mpesa_transaction_code": order.mpesa_transaction_code,
            "delivery_address": order.delivery_address,
            "delivery_phone": order.delivery_phone,
            "created_at": (
                order.created_at.isoformat()
                if order.created_at else None
            )
        })

    return jsonify({
        "status": "success",
        "orders": results
    }), 200

@merchandise_bp.route(
    "/admin/orders/<int:order_id>",
    methods=["PATCH"]
)
@admin_required()
def update_merchandise_order(order_id):
    order = db.session.query(
        MerchandiseOrder
    ).filter_by(
        id=order_id
    ).with_for_update().first()

    if not order:
        return jsonify({
            "status": "error",
            "message": "Order not found."
        }), 404

    data = request.get_json(silent=True) or {}

    new_status = data.get("status")
    new_payment_status = data.get("payment_status")

    allowed_statuses = {
        "Pending",
        "Processing",
        "Shipped",
        "Completed",
        "Cancelled"
    }

    allowed_payment_statuses = {
        "Verification Pending",
        "Paid",
        "Rejected"
    }

    if new_status is not None and new_status not in allowed_statuses:
        return jsonify({
            "status": "error",
            "message": "Invalid order status."
        }), 400

    if (
        new_payment_status is not None
        and new_payment_status not in allowed_payment_statuses
    ):
        return jsonify({
            "status": "error",
            "message": "Invalid payment status."
        }), 400

    if order.status == "Cancelled" and (
        new_status is not None and new_status != "Cancelled"
    ):
        return jsonify({
            "status": "error",
            "message": "A cancelled order cannot be reopened."
        }), 409

    if new_status == "Cancelled" and order.status != "Cancelled":
        try:
            for item in order.items:
                variant = db.session.query(
                    MerchandiseVariant
                ).filter_by(
                    id=item.variant_id
                ).with_for_update().first()

                if variant:
                    variant.stock_quantity += item.quantity

            order.status = "Cancelled"

            if order.payment_status != "Paid":
                order.payment_status = "Rejected"

            db.session.commit()

        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({
                "status": "error",
                "message": "Could not cancel the order."
            }), 500

    else:
        if new_payment_status == "Paid":
            if not order.mpesa_transaction_code:
                return jsonify({
                    "status": "error",
                    "message": "A transaction reference is required before verifying payment."
                }), 400

            if order.status == "Cancelled":
                return jsonify({
                    "status": "error",
                    "message": "Payment cannot be verified for a cancelled order."
                }), 409

        if new_status is not None:
            order.status = new_status

        if new_payment_status is not None:
            order.payment_status = new_payment_status

        try:
            db.session.commit()
        except SQLAlchemyError:
            current_app.logger.exception(
                "MERCHANDISE ORDER UPDATE DATABASE ERROR"
            )
            db.session.rollback()
            return jsonify({
                "status": "error",
                "message": "Could not update the order."
            }), 500

    return jsonify({
        "status": "success",
        "message": "Order updated successfully.",
        "order": {
            "id": order.id,
            "status": order.status,
            "payment_status": order.payment_status
        }
    }), 200