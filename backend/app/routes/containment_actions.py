from datetime import datetime

from flask import Blueprint, jsonify, request

from app import db
from app.models.case import Case
from app.models.affected_user import AffectedUser
from app.models.containment_action import ContainmentAction
from app.routes.auth import login_required


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
@login_required
def create_containment_action(case_id):

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


    action_type = str(
        data.get("action_type", "")
    ).strip()


    if not action_type:
        return jsonify({
            "error": "action_type is required"
        }), 400


    affected_user_id = data.get(
        "affected_user_id"
    )


    # =====================================================
    # VALIDATE AFFECTED USER
    # =====================================================

    if affected_user_id:

        try:

            affected_user_id = int(
                affected_user_id
            )

        except (TypeError, ValueError):

            return jsonify({
                "error":
                    "affected_user_id must be a valid integer"
            }), 400


        user = db.session.get(
            AffectedUser,
            affected_user_id
        )


        if (
            not user
            or user.case_id != case_id
        ):

            return jsonify({
                "error": (
                    "Affected user does not belong "
                    "to this case"
                )
            }), 400


    # =====================================================
    # VALIDATE STATUS
    # =====================================================

    status = str(
        data.get(
            "status",
            "pending"
        )
    ).lower().strip()


    allowed_statuses = [
        "pending",
        "in_progress",
        "completed",
        "failed"
    ]


    if status not in allowed_statuses:

        return jsonify({
            "error":
                "Invalid containment action status"
        }), 400


    # =====================================================
    # CREATE ACTION
    # =====================================================

    action = ContainmentAction(

        case_id=case_id,

        affected_user_id=affected_user_id,

        action_type=action_type,

        target=data.get(
            "target"
        ),

        status=status,

        performed_by=data.get(
            "performed_by"
        ),

        performed_at=(
            datetime.utcnow()
            if status == "completed"
            else None
        ),

        notes=data.get(
            "notes"
        )

    )


    try:

        db.session.add(
            action
        )

        db.session.commit()

    except Exception as error:

        db.session.rollback()

        print(
            "Containment action creation error:",
            error
        )

        return jsonify({
            "error":
                "Failed to create containment action"
        }), 500


    return jsonify({

        "message":
            "Containment action created successfully",

        "containment_action":
            action.to_dict()

    }), 201


# =========================================================
# GET CONTAINMENT ACTIONS FOR A CASE
# =========================================================

@containment_actions.get(
    "/api/cases/<int:case_id>/containment-actions"
)
@login_required
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

        "case_id":
            case_id,

        "count":
            len(actions),

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
@login_required
def get_containment_action(action_id):

    action = db.session.get(
        ContainmentAction,
        action_id
    )


    if not action:

        return jsonify({
            "error":
                "Containment action not found"
        }), 404


    return jsonify({

        "containment_action":
            action.to_dict()

    })


# =========================================================
# UPDATE CONTAINMENT ACTION
# =========================================================

@containment_actions.put(
    "/api/containment-actions/<int:action_id>"
)
@login_required
def update_containment_action(action_id):

    action = db.session.get(
        ContainmentAction,
        action_id
    )


    if not action:

        return jsonify({
            "error":
                "Containment action not found"
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
    # ACTION TYPE
    # =====================================================

    if "action_type" in data:

        action_type = str(
            data["action_type"]
        ).strip()


        if not action_type:

            return jsonify({
                "error":
                    "action_type cannot be empty"
            }), 400


        action.action_type = action_type


    # =====================================================
    # TARGET
    # =====================================================

    if "target" in data:

        action.target = data[
            "target"
        ]


    # =====================================================
    # STATUS
    # =====================================================

    if "status" in data:

        status = str(
            data["status"]
        ).lower().strip()


        allowed_statuses = [
            "pending",
            "in_progress",
            "completed",
            "failed"
        ]


        if status not in allowed_statuses:

            return jsonify({
                "error":
                    "Invalid containment action status"
            }), 400


        action.status = status


        if status == "completed":

            action.performed_at = (
                datetime.utcnow()
            )

        else:

            action.performed_at = None


    # =====================================================
    # PERFORMED BY
    # =====================================================

    if "performed_by" in data:

        action.performed_by = (
            data["performed_by"]
        )


    # =====================================================
    # NOTES
    # =====================================================

    if "notes" in data:

        action.notes = data[
            "notes"
        ]


    # =====================================================
    # SAVE
    # =====================================================

    try:

        db.session.commit()

    except Exception as error:

        db.session.rollback()

        print(
            "Containment action update error:",
            error
        )

        return jsonify({
            "error":
                "Failed to update containment action"
        }), 500


    return jsonify({

        "message":
            "Containment action updated successfully",

        "containment_action":
            action.to_dict()

    })


# =========================================================
# DELETE CONTAINMENT ACTION
# =========================================================

@containment_actions.delete(
    "/api/containment-actions/<int:action_id>"
)
@login_required
def delete_containment_action(action_id):

    action = db.session.get(
        ContainmentAction,
        action_id
    )


    if not action:

        return jsonify({
            "error":
                "Containment action not found"
        }), 404


    try:

        db.session.delete(
            action
        )

        db.session.commit()

    except Exception as error:

        db.session.rollback()

        print(
            "Containment action deletion error:",
            error
        )

        return jsonify({
            "error":
                "Failed to delete containment action"
        }), 500


    return jsonify({

        "message":
            "Containment action deleted successfully"

    })