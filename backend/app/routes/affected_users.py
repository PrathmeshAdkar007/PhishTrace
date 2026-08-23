from datetime import datetime

from flask import Blueprint, jsonify, request

from app import db
from app.models.case import Case
from app.models.affected_user import AffectedUser
from app.routes.auth import login_required


affected_users = Blueprint(
    "affected_users",
    __name__
)


# =========================================================
# CREATE AFFECTED USER
# =========================================================

@affected_users.post(
    "/api/cases/<int:case_id>/affected-users"
)
@login_required
def create_affected_user(case_id):

    case = db.session.get(
        Case,
        case_id
    )

    if not case:
        return jsonify({
            "error": "Case not found"
        }), 404


    data = request.get_json(
        silent=True
    ) or {}


    if not data:
        return jsonify({
            "error": "Request body must be JSON"
        }), 400


    user_email = str(
        data.get("user_email", "")
    ).strip().lower()


    if not user_email:
        return jsonify({
            "error": "user_email is required"
        }), 400


    existing = AffectedUser.query.filter_by(
        case_id=case_id,
        user_email=user_email
    ).first()


    if existing:
        return jsonify({
            "error":
                "Affected user already exists for this case"
        }), 409


    now = datetime.utcnow()


    user = AffectedUser(

        case_id=case_id,

        user_email=user_email,

        display_name=data.get(
            "display_name"
        ),

        department=data.get(
            "department"
        ),

        received_email=data.get(
            "received_email",
            False
        ),

        clicked_link=data.get(
            "clicked_link",
            False
        ),

        submitted_credentials=data.get(
            "submitted_credentials",
            False
        ),

        account_compromised=data.get(
            "account_compromised",
            False
        ),

        impact_status=data.get(
            "impact_status",
            "unknown"
        ),

        first_seen=data.get(
            "first_seen"
        ) or now,

        last_seen=data.get(
            "last_seen"
        ) or now,

        notes=data.get(
            "notes"
        )

    )


    try:

        db.session.add(
            user
        )

        db.session.commit()

    except Exception:

        db.session.rollback()

        return jsonify({
            "error":
                "Failed to create affected user"
        }), 500


    return jsonify({

        "message":
            "Affected user created successfully",

        "affected_user":
            user.to_dict()

    }), 201


# =========================================================
# GET AFFECTED USERS FOR CASE
# =========================================================

@affected_users.get(
    "/api/cases/<int:case_id>/affected-users"
)
@login_required
def get_affected_users(case_id):

    case = db.session.get(
        Case,
        case_id
    )

    if not case:
        return jsonify({
            "error": "Case not found"
        }), 404


    users = AffectedUser.query.filter_by(
        case_id=case_id
    ).order_by(
        AffectedUser.created_at.desc()
    ).all()


    return jsonify({

        "case_id":
            case_id,

        "count":
            len(users),

        "affected_users": [

            user.to_dict()

            for user in users

        ]

    })


# =========================================================
# GET SINGLE AFFECTED USER
# =========================================================

@affected_users.get(
    "/api/affected-users/<int:user_id>"
)
@login_required
def get_affected_user(user_id):

    user = db.session.get(
        AffectedUser,
        user_id
    )


    if not user:

        return jsonify({
            "error":
                "Affected user not found"
        }), 404


    return jsonify({

        "affected_user":
            user.to_dict()

    })


# =========================================================
# UPDATE AFFECTED USER
# =========================================================

@affected_users.put(
    "/api/affected-users/<int:user_id>"
)
@login_required
def update_affected_user(user_id):

    user = db.session.get(
        AffectedUser,
        user_id
    )


    if not user:

        return jsonify({
            "error":
                "Affected user not found"
        }), 404


    data = request.get_json(
        silent=True
    ) or {}


    if not data:

        return jsonify({
            "error":
                "Request body must be JSON"
        }), 400


    # =====================================================
    # ALLOWED FIELDS
    # =====================================================

    allowed_fields = [

        "user_email",

        "display_name",

        "department",

        "received_email",

        "clicked_link",

        "submitted_credentials",

        "account_compromised",

        "impact_status",

        "notes"

    ]


    # =====================================================
    # EMAIL
    # =====================================================

    if "user_email" in data:

        user_email = str(
            data["user_email"]
        ).strip().lower()


        if not user_email:

            return jsonify({
                "error":
                    "user_email cannot be empty"
            }), 400


        existing = AffectedUser.query.filter(

            AffectedUser.case_id ==
            user.case_id,

            AffectedUser.user_email ==
            user_email,

            AffectedUser.id !=
            user_id

        ).first()


        if existing:

            return jsonify({
                "error":
                    "Affected user already exists for this case"
            }), 409


        user.user_email = user_email


    # =====================================================
    # OTHER ALLOWED FIELDS
    # =====================================================

    for field in allowed_fields:

        if field in data and field != "user_email":

            setattr(
                user,
                field,
                data[field]
            )


    # =====================================================
    # UPDATE LAST SEEN
    # =====================================================

    user.last_seen = datetime.utcnow()


    try:

        db.session.commit()

    except Exception:

        db.session.rollback()

        return jsonify({
            "error":
                "Failed to update affected user"
        }), 500


    return jsonify({

        "message":
            "Affected user updated successfully",

        "affected_user":
            user.to_dict()

    })