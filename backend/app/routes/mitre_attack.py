from flask import Blueprint, jsonify, request

from app import db
from app.models.finding import Finding
from app.models.mitre_attack_mapping import MitreAttackMapping


mitre_attack = Blueprint(
    "mitre_attack",
    __name__
)


@mitre_attack.post("/api/findings/<int:finding_id>/mitre")
def create_mitre_mapping(finding_id):
    finding = db.session.get(
        Finding,
        finding_id
    )

    if not finding:
        return jsonify({
            "error": "Finding not found"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body must be JSON"
        }), 400

    required_fields = [
        "technique_id",
        "technique_name"
    ]

    for field in required_fields:
        if not data.get(field):
            return jsonify({
                "error": f"{field} is required"
            }), 400

    mapping = MitreAttackMapping(
        finding_id=finding_id,
        technique_id=data["technique_id"],
        technique_name=data["technique_name"],
        tactic=data.get("tactic"),
        description=data.get("description"),
        evidence=data.get("evidence")
    )

    db.session.add(mapping)
    db.session.commit()

    return jsonify({
        "message": "MITRE ATT&CK mapping created successfully",
        "mapping": mapping.to_dict()
    }), 201


@mitre_attack.get("/api/findings/<int:finding_id>/mitre")
def get_mitre_mappings(finding_id):
    finding = db.session.get(
        Finding,
        finding_id
    )

    if not finding:
        return jsonify({
            "error": "Finding not found"
        }), 404

    mappings = MitreAttackMapping.query.filter_by(
        finding_id=finding_id
    ).order_by(
        MitreAttackMapping.created_at.desc()
    ).all()

    return jsonify({
        "finding_id": finding_id,
        "count": len(mappings),
        "mitre_mappings": [
            mapping.to_dict()
            for mapping in mappings
        ]
    })


@mitre_attack.get("/api/mitre/<int:mapping_id>")
def get_mitre_mapping(mapping_id):
    mapping = db.session.get(
        MitreAttackMapping,
        mapping_id
    )

    if not mapping:
        return jsonify({
            "error": "MITRE ATT&CK mapping not found"
        }), 404

    return jsonify({
        "mapping": mapping.to_dict()
    })


@mitre_attack.put("/api/mitre/<int:mapping_id>")
def update_mitre_mapping(mapping_id):
    mapping = db.session.get(
        MitreAttackMapping,
        mapping_id
    )

    if not mapping:
        return jsonify({
            "error": "MITRE ATT&CK mapping not found"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body must be JSON"
        }), 400

    allowed_fields = [
        "technique_id",
        "technique_name",
        "tactic",
        "description",
        "evidence"
    ]

    for field in allowed_fields:
        if field in data:
            setattr(
                mapping,
                field,
                data[field]
            )

    db.session.commit()

    return jsonify({
        "message": "MITRE ATT&CK mapping updated successfully",
        "mapping": mapping.to_dict()
    })