from flask import Blueprint, jsonify, request

from app import db
from app.models.case import Case
from app.routes.auth import login_required


cases = Blueprint("cases", __name__)


# =========================================================
# CREATE CASE
# =========================================================

@cases.post("/api/cases")
@login_required
def create_case():

    data = request.get_json(
        silent=True
    ) or {}


    if not data:
        return jsonify({
            "error": "Request body must be JSON"
        }), 400


    required_fields = [
        "case_number",
        "title"
    ]


    for field in required_fields:

        if not str(
            data.get(field, "")
        ).strip():

            return jsonify({
                "error": f"{field} is required"
            }), 400


    case_number = str(
        data["case_number"]
    ).strip()


    title = str(
        data["title"]
    ).strip()


    # =====================================================
    # CHECK DUPLICATE CASE NUMBER
    # =====================================================

    existing_case = Case.query.filter_by(
        case_number=case_number
    ).first()


    if existing_case:

        return jsonify({
            "error": "Case number already exists"
        }), 409


    # =====================================================
    # CREATE CASE
    # =====================================================

    new_case = Case(

        case_number=case_number,

        title=title,

        description=data.get(
            "description"
        ),

        severity=data.get(
            "severity",
            "medium"
        ),

        status=data.get(
            "status",
            "open"
        )

    )


    try:

        db.session.add(
            new_case
        )

        db.session.commit()

    except Exception:

        db.session.rollback()

        return jsonify({
            "error": "Failed to create case"
        }), 500


    return jsonify({

        "message":
            "Case created successfully",

        "case":
            new_case.to_dict()

    }), 201


# =========================================================
# GET ALL CASES
# =========================================================

@cases.get("/api/cases")
@login_required
def get_cases():

    cases_list = Case.query.order_by(
        Case.created_at.desc()
    ).all()


    return jsonify({

        "count":
            len(cases_list),

        "cases": [
            case.to_dict()
            for case in cases_list
        ]

    })


# =========================================================
# GET SINGLE CASE
# =========================================================

@cases.get(
    "/api/cases/<int:case_id>"
)
@login_required
def get_case(case_id):

    case = db.session.get(
        Case,
        case_id
    )


    if not case:

        return jsonify({
            "error": "Case not found"
        }), 404


    return jsonify({

        "case":
            case.to_dict()

    })


# =========================================================
# UPDATE CASE
# =========================================================

@cases.put(
    "/api/cases/<int:case_id>"
)
@login_required
def update_case(case_id):

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


    # =====================================================
    # CASE NUMBER
    # =====================================================

    if "case_number" in data:

        case_number = str(
            data["case_number"]
        ).strip()


        if not case_number:

            return jsonify({
                "error":
                    "case_number cannot be empty"
            }), 400


        existing_case = Case.query.filter(

            Case.case_number ==
            case_number,

            Case.id != case_id

        ).first()


        if existing_case:

            return jsonify({
                "error":
                    "Case number already exists"
            }), 409


        case.case_number = case_number


    # =====================================================
    # TITLE
    # =====================================================

    if "title" in data:

        title = str(
            data["title"]
        ).strip()


        if not title:

            return jsonify({
                "error":
                    "title cannot be empty"
            }), 400


        case.title = title


    # =====================================================
    # DESCRIPTION
    # =====================================================

    if "description" in data:

        case.description = data[
            "description"
        ]


    # =====================================================
    # SEVERITY
    # =====================================================

    if "severity" in data:

        allowed_severities = [
            "low",
            "medium",
            "high",
            "critical"
        ]


        severity = str(
            data["severity"]
        ).lower().strip()


        if severity not in allowed_severities:

            return jsonify({
                "error":
                    "Invalid severity"
            }), 400


        case.severity = severity


    # =====================================================
    # STATUS
    # =====================================================

    if "status" in data:

        allowed_statuses = [
            "open",
            "investigating",
            "closed"
        ]


        status = str(
            data["status"]
        ).lower().strip()


        if status not in allowed_statuses:

            return jsonify({
                "error":
                    "Invalid case status"
            }), 400


        case.status = status


    # =====================================================
    # SAVE
    # =====================================================

    try:

        db.session.commit()

    except Exception:

        db.session.rollback()

        return jsonify({
            "error":
                "Failed to update case"
        }), 500


    return jsonify({

        "message":
            "Case updated successfully",

        "case":
            case.to_dict()

    })


# =========================================================
# CLOSE CASE
# =========================================================

@cases.patch(
    "/api/cases/<int:case_id>/close"
)
@login_required
def close_case(case_id):

    case = db.session.get(
        Case,
        case_id
    )


    if not case:

        return jsonify({
            "error": "Case not found"
        }), 404


    if case.status == "closed":

        return jsonify({
            "error":
                "Case is already closed"
        }), 409


    case.status = "closed"


    try:

        db.session.commit()

    except Exception:

        db.session.rollback()

        return jsonify({
            "error":
                "Failed to close case"
        }), 500


    return jsonify({

        "message":
            "Case closed successfully",

        "case":
            case.to_dict()

    })