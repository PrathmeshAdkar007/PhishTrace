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


# =========================================================
# CREATE CONTAINMENT ACTION
# =========================================================

@containment_actions.post(
    "/api/cases/<int:case_id>/containment-actions"
)
def create_containment_action(case_id):

    case = db.session.get(
        Case,
        case_id
    )

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

    affected_user_id = data.get(
        "affected_user_id"
    )

    # -----------------------------------------------------
    # Validate affected user
    # -----------------------------------------------------

    if affected_user_id:

        user = db.session.get(
            AffectedUser,
            affected_user_id
        )

        if not user or user.case_id != case_id:

            return jsonify({
                "error": (
                    "Affected user does not belong "
                    "to this case"
                )
            }), 400

    # -----------------------------------------------------
    # Create action
    # -----------------------------------------------------

    action = ContainmentAction(

        case_id=case_id,

        affected_user_id=affected_user_id,

        action_type=data["action_type"],

        target=data.get("target"),

        status=data.get(
            "status",
            "pending"
        ),

        performed_by=data.get(
            "performed_by"
        ),

        performed_at=(
            datetime.utcnow()
            if data.get("status") == "completed"
            else None
        ),

        notes=data.get("notes")
    )

    try:

        db.session.add(action)

        db.session.commit()

    except Exception as error:

        db.session.rollback()

        print(
            "Containment action creation error:",
            error
        )

        return jsonify({
            "error": (
                "Failed to create containment action"
            )
        }), 500

    return jsonify({

        "message": (
            "Containment action created successfully"
        ),

        "containment_action": action.to_dict()

    }), 201


# =========================================================
# GET CONTAINMENT ACTIONS FOR A CASE
# =========================================================

@containment_actions.get(
    "/api/cases/<int:case_id>/containment-actions"
)
def get_containment_actions(case_id):

    case = db.session.get(
        Case,
        case_id
    )

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


# =========================================================
# GET SINGLE CONTAINMENT ACTION
# =========================================================

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

        "containment_action": (
            action.to_dict()
        )

    })


# =========================================================
# UPDATE CONTAINMENT ACTION
# =========================================================

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

    # -----------------------------------------------------
    # Update action type
    # -----------------------------------------------------

    if "action_type" in data:

        if not data["action_type"]:

            return jsonify({
                "error": "action_type cannot be empty"
            }), 400

        action.action_type = (
            data["action_type"]
        )


    # -----------------------------------------------------
    # Update target
    # -----------------------------------------------------

    if "target" in data:

        action.target = data["target"]


    # -----------------------------------------------------
    # Update status
    # -----------------------------------------------------

    if "status" in data:

        action.status = data["status"]

        if data["status"] == "completed":

            action.performed_at = (
                datetime.utcnow()
            )

        else:

            action.performed_at = None


    # -----------------------------------------------------
    # Update performed by
    # -----------------------------------------------------

    if "performed_by" in data:

        action.performed_by = (
            data["performed_by"]
        )


    # -----------------------------------------------------
    # Update notes
    # -----------------------------------------------------

    if "notes" in data:

        action.notes = data["notes"]


    # -----------------------------------------------------
    # Save changes
    # -----------------------------------------------------

    try:

        db.session.commit()

    except Exception as error:

        db.session.rollback()

        print(
            "Containment action update error:",
            error
        )

        return jsonify({
            "error": (
                "Failed to update containment action"
            )
        }), 500

    return jsonify({

        "message": (
            "Containment action updated successfully"
        ),

        "containment_action": (
            action.to_dict()
        )

    })


# =========================================================
# DELETE CONTAINMENT ACTION
# =========================================================

@containment_actions.delete(
    "/api/containment-actions/<int:action_id>"
)
def delete_containment_action(action_id):

    action = db.session.get(
        ContainmentAction,
        action_id
    )

    if not action:
        return jsonify({
            "error": "Containment action not found"
        }), 404

    try:

        db.session.delete(action)

        db.session.commit()

    except Exception as error:

        db.session.rollback()

        print(
            "Containment action deletion error:",
            error
        )

        return jsonify({
            "error": (
                "Failed to delete containment action"
            )
        }), 500

    return jsonify({

        "message": (
            "Containment action deleted successfully"
        )

    })