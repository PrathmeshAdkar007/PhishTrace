from flask import Blueprint, jsonify
from sqlalchemy import text

from app import db


health = Blueprint("health", __name__)


@health.get("/api/health")
def health_check():
    return jsonify({
        "status": "ok",
        "application": "PhishTrace"
    })


@health.get("/api/health/db")
def database_health_check():
    try:
        db.session.execute(text("SELECT 1"))

        return jsonify({
            "status": "ok",
            "database": "connected"
        })

    except Exception as error:
        return jsonify({
            "status": "error",
            "database": "connection_failed",
            "message": str(error)
        }), 500