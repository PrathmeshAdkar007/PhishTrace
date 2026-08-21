import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy


load_dotenv()


db = SQLAlchemy()


def create_app():
    app = Flask(__name__)

    # =========================
    # APPLICATION CONFIGURATION
    # =========================

    secret_key = os.getenv("FLASK_SECRET_KEY")

    if not secret_key:
        raise RuntimeError(
            "FLASK_SECRET_KEY is not configured"
        )

    app.config["SECRET_KEY"] = secret_key


    # =========================
    # DATABASE CONFIGURATION
    # =========================

    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise RuntimeError(
            "DATABASE_URL is not configured"
        )

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


    # =========================
    # INITIALIZE EXTENSIONS
    # =========================

    db.init_app(app)

    CORS(
        app,
        origins=["http://localhost:5173"
                 , "http://localhost:5174"
                 , "http://localhost:5175"
                 , "http://localhost:5176"
                 , "http://localhost:5177"
                 , "http://localhost:5178"
                 , "http://localhost:5179"],
        supports_credentials=True
    )


    # =========================
    # IMPORT MODELS
    # =========================

    # Import models so SQLAlchemy registers them
    from app.models import (
        Case,
        Email,
        EmailAuthentication,
        Indicator,
        ThreatIntelResult,
        Finding,
        AffectedUser,
        ContainmentAction,
        MitreAttackMapping,
        User,
    )


    # =========================
    # IMPORT ROUTES
    # =========================

    from app.routes.health import health
    from app.routes.auth import auth

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


    # =========================
    # REGISTER BLUEPRINTS
    # =========================

    app.register_blueprint(health)

    app.register_blueprint(auth)

    app.register_blueprint(cases)

    app.register_blueprint(emails)

    app.register_blueprint(
        email_authentication
    )

    app.register_blueprint(indicators)

    app.register_blueprint(
        threat_intel
    )

    app.register_blueprint(findings)

    app.register_blueprint(risk)

    app.register_blueprint(
        affected_users
    )

    app.register_blueprint(
        containment_actions
    )

    app.register_blueprint(
        mitre_attack
    )

    app.register_blueprint(
        case_summary
    )


    return app