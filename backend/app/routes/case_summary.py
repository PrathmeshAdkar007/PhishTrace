from flask import Blueprint, jsonify

from app import db
from app.models.case import Case
from app.models.email import Email
from app.models.indicator import Indicator
from app.models.finding import Finding
from app.models.affected_user import AffectedUser
from app.models.containment_action import ContainmentAction
from app.models.mitre_attack_mapping import MitreAttackMapping
from app.models.threat_intel_result import ThreatIntelResult

from app.routes.auth import login_required


case_summary = Blueprint(
    "case_summary",
    __name__
)


# =========================================================
# GET COMPLETE CASE SUMMARY
# =========================================================

@case_summary.get(
    "/api/cases/<int:case_id>/summary"
)
@login_required
def get_case_summary(case_id):

    # -----------------------------------------------------
    # Get case
    # -----------------------------------------------------

    case = db.session.get(
        Case,
        case_id
    )

    if not case:

        return jsonify({
            "error":
                "Case not found"
        }), 404


    # -----------------------------------------------------
    # Get emails
    # -----------------------------------------------------

    emails = Email.query.filter_by(
        case_id=case_id
    ).order_by(
        Email.created_at.desc()
    ).all()


    # -----------------------------------------------------
    # Get findings
    # -----------------------------------------------------

    findings = Finding.query.filter_by(
        case_id=case_id
    ).order_by(
        Finding.created_at.desc()
    ).all()


    # -----------------------------------------------------
    # Get affected users
    # -----------------------------------------------------

    affected_users = AffectedUser.query.filter_by(
        case_id=case_id
    ).order_by(
        AffectedUser.created_at.desc()
    ).all()


    # -----------------------------------------------------
    # Get containment actions
    # -----------------------------------------------------

    containment_actions = ContainmentAction.query.filter_by(
        case_id=case_id
    ).order_by(
        ContainmentAction.created_at.desc()
    ).all()


    # -----------------------------------------------------
    # Get MITRE mappings through findings
    # -----------------------------------------------------

    finding_ids = [
        finding.id
        for finding in findings
    ]

    mitre_mappings = []


    if finding_ids:

        mitre_mappings = MitreAttackMapping.query.filter(
            MitreAttackMapping.finding_id.in_(
                finding_ids
            )
        ).order_by(
            MitreAttackMapping.created_at.desc()
        ).all()


    # -----------------------------------------------------
    # Get indicators through emails
    # -----------------------------------------------------

    email_ids = [
        email.id
        for email in emails
    ]

    indicators = []


    if email_ids:

        indicators = Indicator.query.filter(
            Indicator.email_id.in_(
                email_ids
            )
        ).all()


    # -----------------------------------------------------
    # Get threat intelligence through indicators
    # -----------------------------------------------------

    indicator_ids = [
        indicator.id
        for indicator in indicators
    ]

    threat_intel_results = []


    if indicator_ids:

        threat_intel_results = ThreatIntelResult.query.filter(
            ThreatIntelResult.indicator_id.in_(
                indicator_ids
            )
        ).order_by(
            ThreatIntelResult.checked_at.desc()
        ).all()


    # -----------------------------------------------------
    # Return complete case summary
    # -----------------------------------------------------

    return jsonify({

        "case":
            case.to_dict(),

        "emails": [

            email.to_dict()

            for email in emails

        ],

        "indicators": [

            indicator.to_dict()

            for indicator in indicators

        ],

        "threat_intelligence": [

            result.to_dict()

            for result in threat_intel_results

        ],

        "findings": [

            finding.to_dict()

            for finding in findings

        ],

        "affected_users": [

            user.to_dict()

            for user in affected_users

        ],

        "containment_actions": [

            action.to_dict()

            for action in containment_actions

        ],

        "mitre_mappings": [

            mapping.to_dict()

            for mapping in mitre_mappings

        ],

        "counts": {

            "emails":
                len(emails),

            "indicators":
                len(indicators),

            "threat_intelligence":
                len(threat_intel_results),

            "findings":
                len(findings),

            "affected_users":
                len(affected_users),

            "containment_actions":
                len(containment_actions),

            "mitre_mappings":
                len(mitre_mappings)

        }

    })