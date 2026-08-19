from flask import Blueprint, jsonify, request

from app import db
from app.models.case import Case


cases = Blueprint("cases", __name__)


@cases.post("/api/cases")
def create_case():
    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body must be JSON"
        }), 400

    required_fields = ["case_number", "title"]

    for field in required_fields:
        if not data.get(field):
            return jsonify({
                "error": f"{field} is required"
            }), 400

    existing_case = Case.query.filter_by(
        case_number=data["case_number"]
    ).first()

    if existing_case:
        return jsonify({
            "error": "Case number already exists"
        }), 409

    new_case = Case(
        case_number=data["case_number"],
        title=data["title"],
        description=data.get("description"),
        severity=data.get("severity", "medium"),
        status=data.get("status", "open")
    )

    db.session.add(new_case)
    db.session.commit()

    return jsonify({
        "message": "Case created successfully",
        "case": new_case.to_dict()
    }), 201


@cases.get("/api/cases")
def get_cases():
    cases_list = Case.query.order_by(
        Case.created_at.desc()
    ).all()

    return jsonify({
        "count": len(cases_list),
        "cases": [
            case.to_dict()
            for case in cases_list
        ]
    })


@cases.get("/api/cases/<int:case_id>")
def get_case(case_id):
    case = db.session.get(Case, case_id)

    if not case:
        return jsonify({
            "error": "Case not found"
        }), 404

    return jsonify({
        "case": case.to_dict()
    })


@cases.put("/api/cases/<int:case_id>")
def update_case(case_id):
    case = db.session.get(Case, case_id)

    if not case:
        return jsonify({
            "error": "Case not found"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body must be JSON"
        }), 400

    if "case_number" in data:
        existing_case = Case.query.filter(
            Case.case_number == data["case_number"],
            Case.id != case_id
        ).first()

        if existing_case:
            return jsonify({
                "error": "Case number already exists"
            }), 409

        case.case_number = data["case_number"]

    if "title" in data:
        case.title = data["title"]

    if "description" in data:
        case.description = data["description"]

    if "severity" in data:
        case.severity = data["severity"]

    if "status" in data:
        case.status = data["status"]

    db.session.commit()

    return jsonify({
        "message": "Case updated successfully",
        "case": case.to_dict()
    })


@cases.patch("/api/cases/<int:case_id>/close")
def close_case(case_id):
    case = db.session.get(Case, case_id)

    if not case:
        return jsonify({
            "error": "Case not found"
        }), 404

    if case.status == "closed":
        return jsonify({
            "error": "Case is already closed"
        }), 409

    case.status = "closed"

    db.session.commit()

    return jsonify({
        "message": "Case closed successfully",
        "case": case.to_dict()
    })