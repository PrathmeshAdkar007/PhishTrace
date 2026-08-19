import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

load_dotenv()

db = SQLAlchemy()


def create_app():
    app = Flask(__name__)

    # Database configuration
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise RuntimeError("DATABASE_URL is not configured")

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Initialize extensions
    db.init_app(app)
    CORS(app)

    # Import models so SQLAlchemy registers them
    from app.models import Case, Email, EmailAuthentication, Indicator, ThreatIntelResult, Finding, AffectedUser, ContainmentAction, MitreAttackMapping


    # Register routes
    from app.routes import health
    from app.routes.cases import cases
    from app.routes.emails import emails
    from app.routes.email_authentication import email_authentication
    from app.routes.indicators import indicators
    from app.routes.threat_intel import threat_intel
    from app.routes.findings import findings
    from app.routes.risk import risk
    from app.routes.affected_users import affected_users
    from app.routes.containment_actions import containment_actions
    from app.routes.mitre_attack import mitre_attack
    from app.routes.case_summary import case_summary

    app.register_blueprint(health)
    app.register_blueprint(cases)
    app.register_blueprint(emails)
    app.register_blueprint(email_authentication)
    app.register_blueprint(indicators)
    app.register_blueprint(threat_intel)
    app.register_blueprint(findings)
    app.register_blueprint(risk)
    app.register_blueprint(affected_users)
    app.register_blueprint(containment_actions)
    app.register_blueprint(mitre_attack)
    app.register_blueprint(case_summary)

    return app