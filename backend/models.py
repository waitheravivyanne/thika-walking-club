from datetime import datetime, timezone
from extensions import db


class MembershipApplication(db.Model):
    __tablename__ = "membership_applications"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    location = db.Column(db.String(120))
    message = db.Column(db.Text)

    status = db.Column(
        db.String(20),
        nullable=False,
        default="Pending"
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )


class Member(db.Model):
    __tablename__ = "members"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    role = db.Column(
        db.String(20),
        nullable=False,
        default="member"
    )

    is_active = db.Column(db.Boolean, default=True)

    activation_token_hash = db.Column(
    db.String(64),
    unique=True,
    nullable=True
)

    activation_expires_at = db.Column(
    db.DateTime(timezone=True),
    nullable=True
)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

class Feedback(db.Model):
    __tablename__ = "feedback"

    id = db.Column(db.Integer, primary_key=True)

    full_name = db.Column(
        db.String(120),
        nullable=False
    )

    email = db.Column(
        db.String(120),
        nullable=False
    )

    subject = db.Column(
        db.String(200),
        nullable=False
    )

    message = db.Column(
        db.Text,
        nullable=False
    )

    status = db.Column(
        db.String(20),
        nullable=False,
        default="New"
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )    
    

class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(80), nullable=False)
    description = db.Column(db.Text, nullable=False)
    event_date = db.Column(db.Date, nullable=False)
    event_time = db.Column(db.Time, nullable=False)
    location = db.Column(db.String(200), nullable=False)
    fee = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    capacity = db.Column(db.Integer, nullable=True)

    status = db.Column(
        db.String(20),
        nullable=False,
        default="Draft"
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )


class EventRegistration(db.Model):
    __tablename__ = "event_registrations"

    id = db.Column(db.Integer, primary_key=True)

    event_id = db.Column(
        db.Integer,
        db.ForeignKey("events.id"),
        nullable=False
    )

    member_id = db.Column(
        db.Integer,
        db.ForeignKey("members.id"),
        nullable=True
    )

    status = db.Column(
        db.String(20),
        nullable=False,
        default="Registered"
    )
    mpesa_transaction_code = db.Column(
        db.String(40),
        nullable=True
    )

    payment_status = db.Column(
        db.String(30),
        nullable=False,
        default="Not Required"
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    event = db.relationship("Event", backref="registrations")
    member = db.relationship("Member", backref="event_registrations")

    __table_args__ = (
        db.UniqueConstraint(
            "event_id",
            "member_id",
            name="uq_event_member_registration"
        ),
    )


class WebsitePhoto(db.Model):
    __tablename__ = "website_photos"

    id = db.Column(db.Integer, primary_key=True)

    filename = db.Column(
        db.String(255),
        nullable=False,
        unique=True
    )

    original_filename = db.Column(
        db.String(255),
        nullable=False
    )

    caption = db.Column(
        db.String(200),
        nullable=True
    )

    description = db.Column(
        db.Text,
        nullable=True
    )

    placements = db.Column(
        db.JSON,
        nullable=False,
        default=list
    )

    is_published = db.Column(
        db.Boolean,
        nullable=False,
        default=True
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )


class Testimonial(db.Model):
    __tablename__ = "testimonials"

    id = db.Column(db.Integer, primary_key=True)

    member_id = db.Column(
        db.Integer,
        db.ForeignKey("members.id"),
        nullable=True
    )

    message = db.Column(
        db.Text,
        nullable=False
    )

    consent_to_publish = db.Column(
        db.Boolean,
        nullable=False,
        default=False
    )

    status = db.Column(
        db.String(20),
        nullable=False,
        default="Pending"
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    member = db.relationship(
        "Member",
        backref=db.backref("testimonials", lazy=True)
    )

class MerchandiseProduct(db.Model):
    __tablename__ = "merchandise_products"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    image_url = db.Column(db.String(500))
    is_published = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    variants = db.relationship("MerchandiseVariant", backref="product", cascade="all, delete-orphan", lazy=True)


class MerchandiseVariant(db.Model):
    __tablename__ = "merchandise_variants"
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("merchandise_products.id"), nullable=False)
    size = db.Column(db.String(10), nullable=False)
    colour = db.Column(db.String(20), nullable=False)
    stock_quantity = db.Column(db.Integer, nullable=False, default=0)
    __table_args__ = (
        db.UniqueConstraint("product_id", "size", "colour", name="uq_merch_product_size_colour"),
        db.CheckConstraint("stock_quantity >= 0", name="ck_merch_stock_nonnegative"),
    )


class MerchandiseOrder(db.Model):
    __tablename__ = "merchandise_orders"
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey("members.id"), nullable=True)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(30), nullable=False, default="Pending")
    payment_status = db.Column(db.String(30), nullable=False, default="Unpaid")
    payment_method = db.Column(db.String(40))
    mpesa_transaction_code = db.Column(db.String(40), nullable=True)
    delivery_address = db.Column(db.String(250))
    delivery_phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    member = db.relationship("Member", backref=db.backref("merchandise_orders", lazy=True))
    items = db.relationship("MerchandiseOrderItem", backref="order", cascade="all, delete-orphan", lazy=True)


class MerchandiseOrderItem(db.Model):
    __tablename__ = "merchandise_order_items"
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("merchandise_orders.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("merchandise_products.id"), nullable=False)
    variant_id = db.Column(db.Integer, db.ForeignKey("merchandise_variants.id"), nullable=False)
    product_name = db.Column(db.String(150), nullable=False)
    size = db.Column(db.String(10), nullable=False)
    colour = db.Column(db.String(20), nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    product = db.relationship("MerchandiseProduct")
    variant = db.relationship("MerchandiseVariant")



class Advertisement(db.Model):
    __tablename__ = "advertisements"

    id = db.Column(db.Integer, primary_key=True)

    advertiser_name = db.Column(db.String(150), nullable=False)
    business_name = db.Column(db.String(150))
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)

    headline = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    image = db.Column(db.String(500))
    original_filename = db.Column(db.String(255))
    destination_url = db.Column(db.String(500), nullable=False)

    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    advertising_fee = db.Column(db.Numeric(10, 2), nullable=True)

    mpesa_transaction_code = db.Column(db.String(40), nullable=True)

    payment_status = db.Column(
        db.String(20),
        nullable=False,
        default="Pending"
    )

    approval_status = db.Column(
        db.String(20),
        nullable=False,
        default="Pending"
    )

    is_active = db.Column(db.Boolean, nullable=False, default=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )


class TrainingEnquiry(db.Model):
    __tablename__ = "training_enquiries"

    id = db.Column(db.Integer, primary_key=True)

    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)

    preferred_days = db.Column(db.String(200))
    preferred_time = db.Column(db.String(120))
    message = db.Column(db.Text)

    package_name = db.Column(
        db.String(120),
        nullable=False,
        default="Personal Training - 5 Sessions"
    )

    package_price = db.Column(
        db.Numeric(10, 2),
        nullable=False,
        default=1000
    )

    status = db.Column(
        db.String(20),
        nullable=False,
        default="New"
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )
