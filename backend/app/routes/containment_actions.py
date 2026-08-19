from datetime import datetime

from flask import Blueprint, jsonify, request

from app import db
from app.models.case import Case
from app.models.affected_user import AffectedUser
from app.models.containment_action import ContainmentAction


containment_actions = Blueprint(
    "containment_actions",
    __name__
)


@containment_actions.post(
    "/api/cases/<int:case_id>/containment-actions"
)
def create_containment_action(case_id):
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

    if not data.get("action_type"):
        return jsonify({
            "error": "action_type is required"
        }), 400

    affected_user_id = data.get("affected_user_id")

    if affected_user_id:
        user = db.session.get(
            AffectedUser,
            affected_user_id
        )

        if not user or user.case_id != case_id:
            return jsonify({
                "error": "Affected user does not belong to this case"
            }), 400

    action = ContainmentAction(
        case_id=case_id,
        affected_user_id=affected_user_id,
        action_type=data["action_type"],
        target=data.get("target"),
        status=data.get("status", "pending"),
        performed_by=data.get("performed_by"),
        performed_at=datetime.utcnow()
        if data.get("status") == "completed"
        else None,
        notes=data.get("notes")
    )

    db.session.add(action)
    db.session.commit()

    return jsonify({
        "message": "Containment action created successfully",
        "containment_action": action.to_dict()
    }), 201


@containment_actions.get(
    "/api/cases/<int:case_id>/containment-actions"
)
def get_containment_actions(case_id):
    case = db.session.get(Case, case_id)

    if not case:
        return jsonify({
            "error": "Case not found"
        }), 404

    actions = ContainmentAction.query.filter_by(
        case_id=case_id
    ).order_by(
        ContainmentAction.created_at.desc()
    ).all()

    return jsonify({
        "case_id": case_id,
        "count": len(actions),
        "containment_actions": [
            action.to_dict()
            for action in actions
        ]
    })


@containment_actions.get(
    "/api/containment-actions/<int:action_id>"
)
def get_containment_action(action_id):
    action = db.session.get(
        ContainmentAction,
        action_id
    )

    if not action:
        return jsonify({
            "error": "Containment action not found"
        }), 404

    return jsonify({
        "containment_action": action.to_dict()
    })


@containment_actions.put(
    "/api/containment-actions/<int:action_id>"
)
def update_containment_action(action_id):
    action = db.session.get(
        ContainmentAction,
        action_id
    )

    if not action:
        return jsonify({
            "error": "Containment action not found"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body must be JSON"
        }), 400

    if "action_type" in data:
        action.action_type = data["action_type"]

    if "target" in data:
        action.target = data["target"]

    if "status" in data:
        action.status = data["status"]

        if data["status"] == "completed":
            action.performed_at = datetime.utcnow()

    if "performed_by" in data:
        action.performed_by = data["performed_by"]

    if "notes" in data:
        action.notes = data["notes"]

    db.session.commit()

    return jsonify({
        "message": "Containment action updated successfully",
        "containment_action": action.to_dict()
    })