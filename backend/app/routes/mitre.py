from flask import Blueprint, jsonify, request

from app import db

from app.models.mitre_attack_mapping import (
    MitreAttackMapping
)

from app.models.finding import Finding
from app.models.case import Case

from app.routes.auth import login_required


mitre = Blueprint(
    "mitre",
    __name__
)


# =========================================================
# AUTOMATIC MITRE ATT&CK MAPPING RULES
# =========================================================

def get_automatic_mappings(finding):

    text = " ".join([
        finding.title or "",
        finding.description or "",
        finding.finding_type or ""
    ]).lower()


    mappings = []


    # =====================================================
    # PHISHING
    # =====================================================

    phishing_keywords = [
        "phishing",
        "malicious indicator",
        "credential harvesting",
        "lookalike domain"
    ]


    if any(
        keyword in text
        for keyword in phishing_keywords
    ):

        mappings.append({

            "technique_id":
                "T1566",

            "technique_name":
                "Phishing",

            "tactic":
                "Initial Access",

            "description":
                "Adversaries may send phishing messages to "
                "gain access to victim systems or accounts.",

            "evidence":
                finding.title

        })


    # =====================================================
    # SPEARPHISHING LINK
    # =====================================================

    link_keywords = [
        "malicious link",
        "suspicious url",
        "phishing url",
        "credential link"
    ]


    if any(
        keyword in text
        for keyword in link_keywords
    ):

        mappings.append({

            "technique_id":
                "T1566.002",

            "technique_name":
                "Spearphishing Link",

            "tactic":
                "Initial Access",

            "description":
                "Adversaries may send spearphishing messages "
                "with malicious links.",

            "evidence":
                finding.title

        })


    # =====================================================
    # SPEARPHISHING ATTACHMENT
    # =====================================================

    attachment_keywords = [
        "malicious attachment",
        "suspicious attachment",
        "email attachment",
        "infected attachment"
    ]


    if any(
        keyword in text
        for keyword in attachment_keywords
    ):

        mappings.append({

            "technique_id":
                "T1566.001",

            "technique_name":
                "Spearphishing Attachment",

            "tactic":
                "Initial Access",

            "description":
                "Adversaries may send spearphishing messages "
                "with malicious attachments.",

            "evidence":
                finding.title

        })


    # =====================================================
    # INPUT CAPTURE / CREDENTIAL HARVESTING
    # =====================================================

    credential_keywords = [
        "credential",
        "password",
        "login page",
        "account credentials"
    ]


    if any(
        keyword in text
        for keyword in credential_keywords
    ):

        mappings.append({

            "technique_id":
                "T1056",

            "technique_name":
                "Input Capture",

            "tactic":
                "Credential Access",

            "description":
                "Adversaries may capture credentials through "
                "malicious forms or credential collection.",

            "evidence":
                finding.title

        })


    return mappings


# =========================================================
# GET ALL MITRE ATT&CK MAPPINGS
# =========================================================

@mitre.get(
    "/api/mitre"
)
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
# AUTOMATICALLY MAP A FINDING
# =========================================================

@mitre.post(
    "/api/findings/<int:finding_id>/mitre/auto"
)
@login_required
def auto_map_finding_mitre(
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


    automatic_mappings = (
        get_automatic_mappings(
            finding
        )
    )


    if not automatic_mappings:

        return jsonify({

            "message":
                "No automatic MITRE ATT&CK mappings found",

            "count":
                0,

            "mappings":
                []

        })


    created_mappings = []


    for mapping_data in automatic_mappings:

        existing = (
            MitreAttackMapping.query.filter_by(

                finding_id=finding_id,

                technique_id=(
                    mapping_data[
                        "technique_id"
                    ]
                )

            ).first()
        )


        if existing:

            created_mappings.append(
                existing.to_dict()
            )

            continue


        mapping = MitreAttackMapping(

            finding_id=finding_id,

            technique_id=(
                mapping_data[
                    "technique_id"
                ]
            ),

            technique_name=(
                mapping_data[
                    "technique_name"
                ]
            ),

            tactic=(
                mapping_data[
                    "tactic"
                ]
            ),

            description=(
                mapping_data[
                    "description"
                ]
            ),

            evidence=(
                mapping_data[
                    "evidence"
                ]
            )

        )


        db.session.add(
            mapping
        )


        db.session.flush()


        created_mappings.append(
            mapping.to_dict()
        )


    try:

        db.session.commit()

    except Exception as error:

        db.session.rollback()

        print(
            "Automatic MITRE mapping error:",
            error
        )

        return jsonify({
            "error":
                "Failed to create automatic MITRE mappings"
        }), 500


    return jsonify({

        "message":
            "Automatic MITRE ATT&CK mapping completed",

        "finding_id":
            finding_id,

        "count":
            len(created_mappings),

        "mappings":
            created_mappings

    }), 201


# =========================================================
# CREATE MANUAL MITRE ATT&CK MAPPING
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


    existing = MitreAttackMapping.query.filter_by(

        finding_id=finding_id,

        technique_id=technique_id

    ).first()


    if existing:

        return jsonify({

            "error":
                "This MITRE technique is already mapped to this finding",

            "mapping":
                existing.to_dict()

        }), 409


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

        "message":
            "MITRE ATT&CK mapping created successfully",

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

        "message":
            "MITRE ATT&CK mapping deleted successfully"

    })