from getpass import getpass

from werkzeug.security import generate_password_hash

from app import app
from extensions import db
from models import Member


def create_admin():
    print("\nTHIKA WALKING CLUB - ADMIN SETUP\n")

    full_name = input("PAT: ").strip()
    email = input("Admin@gmail.com: ").strip().lower()
    phone = input("0712345678: ").strip()

    password = getpass("123456: ")
    confirm_password = getpass("123456: ")

    if not full_name or not email or not phone:
        print("All fields are required.")
        return

    if password != confirm_password:
        print("Passwords do not match.")
        return

    if len(password) < 6:
        print("Use a password with at least 6 characters.")
        return

    with app.app_context():
        existing_member = Member.query.filter_by(email=email).first()

        if existing_member:
            print("An account with this email already exists.")
            return

        admin = Member(
            full_name=full_name,
            email=email,
            phone=phone,
            password_hash=generate_password_hash(password),
            role="admin"
        )

        db.session.add(admin)
        db.session.commit()

        print("\nAdministrator account created successfully!")


if __name__ == "__main__":
    create_admin()