from flask import Blueprint, jsonify, request

from app import db
from app.models.email import Email
from app.models.email_authentication import EmailAuthentication


email_authentication = Blueprint(
    "email_authentication",
    __name__
)


@email_authentication.post("/api/emails/<int:email_id>/authentication")
def create_email_authentication(email_id):
    email = db.session.get(Email, email_id)

    if not email:
        return jsonify({
            "error": "Email not found"
        }), 404

    existing = EmailAuthentication.query.filter_by(
        email_id=email_id
    ).first()

    if existing:
        return jsonify({
            "error": "Authentication analysis already exists for this email"
        }), 409

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body must be JSON"
        }), 400

    authentication = EmailAuthentication(
        email_id=email_id,
        spf_result=data.get("spf_result"),
        dkim_result=data.get("dkim_result"),
        dmarc_result=data.get("dmarc_result"),
        dmarc_alignment=data.get("dmarc_alignment"),
        from_domain=data.get("from_domain"),
        return_path_domain=data.get("return_path_domain"),
        dkim_domain=data.get("dkim_domain"),
        authentication_verdict=data.get(
            "authentication_verdict"
        ),
        analysis_notes=data.get("analysis_notes")
    )

    db.session.add(authentication)
    db.session.commit()

    return jsonify({
        "message": "Email authentication analysis created successfully",
        "authentication": authentication.to_dict()
    }), 201


@email_authentication.get("/api/emails/<int:email_id>/authentication")
def get_email_authentication(email_id):
    email = db.session.get(Email, email_id)

    if not email:
        return jsonify({
            "error": "Email not found"
        }), 404

    authentication = EmailAuthentication.query.filter_by(
        email_id=email_id
    ).first()

    if not authentication:
        return jsonify({
            "error": "Authentication analysis not found"
        }), 404

    return jsonify({
        "authentication": authentication.to_dict()
    })