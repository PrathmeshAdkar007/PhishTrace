from flask import Blueprint, jsonify, request

from app import db
from app.models.email import Email
from app.models.case import Case
from app.routes.auth import login_required


emails = Blueprint(
    "emails",
    __name__
)


# =========================================================
# CREATE EMAIL
# =========================================================

@emails.post("/api/emails")
@login_required
def create_email():

    data = request.get_json(
        silent=True
    ) or {}


    if not data:

        return jsonify({
            "error": "Request body must be JSON"
        }), 400


    # =====================================================
    # CASE ID
    # =====================================================

    if not data.get("case_id"):

        return jsonify({
            "error": "case_id is required"
        }), 400


    try:

        case_id = int(
            data["case_id"]
        )

    except (TypeError, ValueError):

        return jsonify({
            "error": "case_id must be a valid integer"
        }), 400


    # =====================================================
    # SENDER
    # =====================================================

    sender = str(
        data.get("sender", "")
    ).strip()


    if not sender:

        return jsonify({
            "error": "sender is required"
        }), 400


    # =====================================================
    # CHECK CASE
    # =====================================================

    case = db.session.get(
        Case,
        case_id
    )


    if not case:

        return jsonify({
            "error": "Case not found"
        }), 404


    # =====================================================
    # CREATE EMAIL
    # =====================================================

    new_email = Email(

        case_id=case_id,

        message_id=data.get(
            "message_id"
        ),

        sender=sender,

        recipient=data.get(
            "recipient"
        ),

        subject=data.get(
            "subject"
        ),

        return_path=data.get(
            "return_path"
        ),

        reply_to=data.get(
            "reply_to"
        ),

        received_at=data.get(
            "received_at"
        ),

        raw_email=data.get(
            "raw_email"
        )

    )


    try:

        db.session.add(
            new_email
        )

        db.session.commit()

    except Exception:

        db.session.rollback()

        return jsonify({
            "error":
                "Failed to create email"
        }), 500


    return jsonify({

        "message":
            "Email created successfully",

        "email":
            new_email.to_dict()

    }), 201


# =========================================================
# GET ALL EMAILS
# =========================================================

@emails.get("/api/emails")
@login_required
def get_emails():

    emails_list = Email.query.order_by(
        Email.created_at.desc()
    ).all()


    return jsonify({

        "count":
            len(emails_list),

        "emails": [

            email.to_dict()

            for email in emails_list

        ]

    })


# =========================================================
# GET SINGLE EMAIL
# =========================================================

@emails.get(
    "/api/emails/<int:email_id>"
)
@login_required
def get_email(email_id):

    email = db.session.get(
        Email,
        email_id
    )


    if not email:

        return jsonify({
            "error": "Email not found"
        }), 404


    return jsonify({

        "email":
            email.to_dict()

    })