from flask import Blueprint, jsonify, request

from app import db
from app.models.email import Email
from app.models.case import Case


emails = Blueprint("emails", __name__)


@emails.post("/api/emails")
def create_email():
    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body must be JSON"
        }), 400

    if not data.get("case_id"):
        return jsonify({
            "error": "case_id is required"
        }), 400

    if not data.get("sender"):
        return jsonify({
            "error": "sender is required"
        }), 400

    case = db.session.get(Case, data["case_id"])

    if not case:
        return jsonify({
            "error": "Case not found"
        }), 404

    new_email = Email(
        case_id=data["case_id"],
        message_id=data.get("message_id"),
        sender=data["sender"],
        recipient=data.get("recipient"),
        subject=data.get("subject"),
        return_path=data.get("return_path"),
        reply_to=data.get("reply_to"),
        received_at=data.get("received_at"),
        raw_email=data.get("raw_email")
    )

    try:
        db.session.add(new_email)
        db.session.commit()

    except Exception:
        db.session.rollback()

        return jsonify({
            "error": "Failed to create email"
        }), 500

    return jsonify({
        "message": "Email created successfully",
        "email": new_email.to_dict()
    }), 201


@emails.get("/api/emails")
def get_emails():
    emails_list = Email.query.order_by(
        Email.created_at.desc()
    ).all()

    return jsonify({
        "count": len(emails_list),
        "emails": [
            email.to_dict()
            for email in emails_list
        ]
    })


@emails.get("/api/emails/<int:email_id>")
def get_email(email_id):
    email = db.session.get(Email, email_id)

    if not email:
        return jsonify({
            "error": "Email not found"
        }), 404

    return jsonify({
        "email": email.to_dict()
    })