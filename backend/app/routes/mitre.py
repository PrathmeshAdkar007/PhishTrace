from flask import Blueprint, jsonify, request

from app import db

from app.models.mitre_attack_mapping import MitreAttackMapping
from app.models.finding import Finding
from app.models.case import Case

from app.routes.auth import login_required


mitre = Blueprint(
    "mitre",
    __name__
)


# =========================================================
# GET ALL MITRE ATT&CK MAPPINGS
# =========================================================

@mitre.get("/api/mitre")
@login_required
def get_all_mitre_mappings():

    mappings = MitreAttackMapping.query.order_by(
        MitreAttackMapping.created_at.desc()
    ).all()


    return jsonify({

        "count":
            len(mappings),

        "mappings": [

            mapping.to_dict()

            for mapping in mappings

        ]

    })


# =========================================================
# GET SINGLE MITRE ATT&CK MAPPING
# =========================================================

@mitre.get(
    "/api/mitre/<int:mapping_id>"
)
@login_required
def get_mitre_mapping(mapping_id):

    mapping = db.session.get(
        MitreAttackMapping,
        mapping_id
    )


    if not mapping:

        return jsonify({
            "error":
                "MITRE mapping not found"
        }), 404


    return jsonify({

        "mapping":
            mapping.to_dict()

    })


# =========================================================
# GET MITRE MAPPINGS FOR A FINDING
# =========================================================

@mitre.get(
    "/api/findings/<int:finding_id>/mitre"
)
@login_required
def get_finding_mitre_mappings(
    finding_id
):

    finding = db.session.get(
        Finding,
        finding_id
    )


    if not finding:

        return jsonify({
            "error":
                "Finding not found"
        }), 404


    mappings = MitreAttackMapping.query.filter_by(
        finding_id=finding_id
    ).order_by(
        MitreAttackMapping.created_at.desc()
    ).all()


    return jsonify({

        "finding_id":
            finding_id,

        "count":
            len(mappings),

        "mappings": [

            mapping.to_dict()

            for mapping in mappings

        ]

    })


# =========================================================
# GET MITRE MAPPINGS FOR A CASE
# =========================================================

@mitre.get(
    "/api/cases/<int:case_id>/mitre"
)
@login_required
def get_case_mitre_mappings(case_id):

    case = db.session.get(
        Case,
        case_id
    )


    if not case:

        return jsonify({
            "error":
                "Case not found"
        }), 404


    findings = Finding.query.filter_by(
        case_id=case_id
    ).all()


    finding_ids = [
        finding.id
        for finding in findings
    ]


    if not finding_ids:

        return jsonify({

            "case_id":
                case_id,

            "count":
                0,

            "mappings":
                []

        })


    mappings = MitreAttackMapping.query.filter(
        MitreAttackMapping.finding_id.in_(
            finding_ids
        )
    ).order_by(
        MitreAttackMapping.created_at.desc()
    ).all()


    return jsonify({

        "case_id":
            case_id,

        "count":
            len(mappings),

        "mappings": [

            mapping.to_dict()

            for mapping in mappings

        ]

    })


# =========================================================
# CREATE MITRE ATT&CK MAPPING
# =========================================================

@mitre.post(
    "/api/findings/<int:finding_id>/mitre"
)
@login_required
def create_mitre_mapping(
    finding_id
):

    finding = db.session.get(
        Finding,
        finding_id
    )


    if not finding:

        return jsonify({
            "error":
                "Finding not found"
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
    # REQUIRED FIELDS
    # =====================================================

    technique_id = str(
        data.get(
            "technique_id",
            ""
        )
    ).strip()


    technique_name = str(
        data.get(
            "technique_name",
            ""
        )
    ).strip()


    if not technique_id:

        return jsonify({
            "error":
                "technique_id is required"
        }), 400


    if not technique_name:

        return jsonify({
            "error":
                "technique_name is required"
        }), 400


    # =====================================================
    # CHECK DUPLICATE
    # =====================================================

    existing = MitreAttackMapping.query.filter_by(

        finding_id=finding_id,

        technique_id=technique_id

    ).first()


    if existing:

        return jsonify({

            "error": (
                "This MITRE technique is already "
                "mapped to this finding"
            ),

            "mapping":
                existing.to_dict()

        }), 409


    # =====================================================
    # CREATE MAPPING
    # =====================================================

    mapping = MitreAttackMapping(

        finding_id=finding_id,

        technique_id=technique_id,

        technique_name=technique_name,

        tactic=data.get(
            "tactic"
        ),

        description=data.get(
            "description"
        ),

        evidence=data.get(
            "evidence"
        )

    )


    try:

        db.session.add(
            mapping
        )

        db.session.commit()

    except Exception as error:

        db.session.rollback()

        print(
            "MITRE mapping creation error:",
            error
        )

        return jsonify({
            "error":
                "Failed to create MITRE mapping"
        }), 500


    return jsonify({

        "message": (
            "MITRE ATT&CK mapping "
            "created successfully"
        ),

        "mapping":
            mapping.to_dict()

    }), 201


# =========================================================
# DELETE MITRE ATT&CK MAPPING
# =========================================================

@mitre.delete(
    "/api/mitre/<int:mapping_id>"
)
@login_required
def delete_mitre_mapping(
    mapping_id
):

    mapping = db.session.get(
        MitreAttackMapping,
        mapping_id
    )


    if not mapping:

        return jsonify({
            "error":
                "MITRE mapping not found"
        }), 404


    try:

        db.session.delete(
            mapping
        )

        db.session.commit()

    except Exception as error:

        db.session.rollback()

        print(
            "MITRE mapping deletion error:",
            error
        )

        return jsonify({
            "error":
                "Failed to delete MITRE mapping"
        }), 500


    return jsonify({

        "message": (
            "MITRE ATT&CK mapping "
            "deleted successfully"
        )

    })