
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

# Database connection
db = SQLAlchemy()

# Database migrations
migrate = Migrate()

# User authentication
jwt = JWTManager()
