
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from extensions import db, migrate, jwt
from models import MembershipApplication, Member, WebsitePhoto, Testimonial
import os
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from routes.membership import membership_bp
from routes.admin import admin_bp
from routes.auth import auth_bp
from routes.activation import activation_bp
from routes.feedback import feedback_bp
from routes.events import events_bp
from routes.photos import photos_bp
from routes.merchandise import merchandise_bp
from routes.testimonials import testimonials_bp
load_dotenv()


def create_app():
    app = Flask(__name__)

    # Application configuration
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    app.config["JWT_SECRET_KEY"] = os.getenv("SECRET_KEY")

    # PostgreSQL database configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Frontend communication
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": ["http://localhost:5173"]
            }
        }
    )

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    app.register_blueprint(
    membership_bp,
    url_prefix="/api/membership"
)
    app.register_blueprint(
    auth_bp,
    url_prefix="/api/auth"
)

    app.register_blueprint(
    admin_bp,
    url_prefix="/api/admin"
)
    app.register_blueprint(
    activation_bp,
    url_prefix="/api/auth"
)
    app.register_blueprint(
    feedback_bp,
    url_prefix="/api/feedback"
)
    app.register_blueprint(
    events_bp,
    url_prefix="/api/events"
)

    app.register_blueprint(
        testimonials_bp,
        url_prefix="/api/testimonials"
    )

    app.register_blueprint(
        photos_bp,
        url_prefix="/api/photos"
    )
    app.register_blueprint(
    merchandise_bp,
    url_prefix="/api/merchandise"
)

    @app.route("/api/stats", methods=["GET"])
    def public_stats():
        try:
            from models import Event, EventRegistration

            active_members = Member.query.filter(
                Member.is_active.is_(True),
                Member.role != "admin"
            ).count()

            total_registrations = EventRegistration.query.filter(
                EventRegistration.status.in_([
                    "Registered",
                    "Pending Payment"
                ])
            ).count()

            published_events = Event.query.filter_by(
                status="Published"
            ).count()

            return jsonify({
                "status": "success",
                "stats": {
                    "members": active_members,
                    "registrations": total_registrations,
                    "events": published_events
                }
            }), 200

        except SQLAlchemyError:
            db.session.rollback()

            return jsonify({
                "status": "error",
                "message": "Unable to load club statistics."
            }), 500

    @app.route("/")
    def home():
        return jsonify({
            "message": "Thika Walking Club API is running!",
            "status": "success"
        })

    @app.route("/api/health")
    def health():
        return jsonify({
            "message": "TWC backend is healthy!",
            "status": "success"
        })

    @app.route("/api/db-health")
    def database_health():
        try:
            db.session.execute(text("SELECT 1"))

            return jsonify({
                "message": "PostgreSQL connection successful!",
                "database": "connected",
                "status": "success"
            })

        except SQLAlchemyError:
            db.session.rollback()

            return jsonify({
                "message": "Database connection failed.",
                "status": "error"
            }), 500

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True, port=5000)
