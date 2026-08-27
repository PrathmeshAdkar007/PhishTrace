from flask import Blueprint, jsonify

from app import db

from app.models.case import Case
from app.models.email import Email
from app.models.indicator import Indicator
from app.models.finding import Finding
from app.models.affected_user import AffectedUser
from app.models.containment_action import (
    ContainmentAction
)
from app.models.mitre_attack_mapping import (
    MitreAttackMapping
)
from app.models.threat_intel_result import (
    ThreatIntelResult
)

from app.routes.auth import login_required
from app.routes.risk import (
    build_risk_assessment
)


report = Blueprint(
    "report",
    __name__
)


# =========================================================
# BUILD EXECUTIVE SUMMARY
# =========================================================

def build_executive_summary(

    case,
    findings,
    indicators,
    threat_intelligence,
    affected_users,
    containment_actions,
    mitre_mappings,
    risk_assessment

):

    # =====================================================
    # MALICIOUS THREAT INTELLIGENCE RESULTS
    # =====================================================

    malicious_results = sum(

        1

        for result in threat_intelligence

        if (
            result.verdict or ""
        ).lower() == "malicious"

    )


    # =====================================================
    # COMPLETED CONTAINMENT ACTIONS
    # =====================================================

    completed_actions = sum(

        1

        for action in containment_actions

        if (
            action.status or ""
        ).lower() == "completed"

    )


    # =====================================================
    # BUILD SUMMARY
    # =====================================================

    return {

        "overview": (

            f"Case {case.case_number} contains "
            f"{len(findings)} investigation findings and "
            f"{len(indicators)} extracted indicators."

        ),

        "risk_summary": (

            f"The overall case risk is "
            f"{risk_assessment['risk_severity']} "
            f"with a score of "
            f"{risk_assessment['risk_score']}/100."

        ),

        "threat_summary": (

            f"{malicious_results} threat intelligence "
            f"results were classified as malicious."

        ),

        "impact_summary": (

            f"{len(affected_users)} affected users "
            f"were identified during the investigation."

        ),

        "containment_summary": (

            f"{completed_actions} of "
            f"{len(containment_actions)} containment "
            f"actions have been completed."

        ),

        "mitre_summary": (

            f"{len(mitre_mappings)} MITRE ATT&CK "
            f"mappings were identified."

        )

    }


# =========================================================
# GET COMPLETE INCIDENT REPORT
# =========================================================

@report.get(
    "/api/cases/<int:case_id>/report"
)
@login_required
def get_incident_report(case_id):


    # =====================================================
    # GET CASE
    # =====================================================

    case = db.session.get(
        Case,
        case_id
    )


    if not case:

        return jsonify({
            "error":
                "Case not found"
        }), 404


    # =====================================================
    # GET EMAILS
    # =====================================================

    emails = Email.query.filter_by(
        case_id=case_id
    ).order_by(
        Email.created_at.asc()
    ).all()


    # =====================================================
    # GET FINDINGS
    # =====================================================

    findings = Finding.query.filter_by(
        case_id=case_id
    ).order_by(
        Finding.created_at.asc()
    ).all()


    # =====================================================
    # GET AFFECTED USERS
    # =====================================================

    affected_users = AffectedUser.query.filter_by(
        case_id=case_id
    ).order_by(
        AffectedUser.created_at.asc()
    ).all()


    # =====================================================
    # GET CONTAINMENT ACTIONS
    # =====================================================

    containment_actions = (
        ContainmentAction.query.filter_by(
            case_id=case_id
        ).order_by(
            ContainmentAction.created_at.asc()
        ).all()
    )


    # =====================================================
    # GET INDICATORS
    # =====================================================

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

        ).order_by(

            Indicator.created_at.asc()

        ).all()


    # =====================================================
    # GET THREAT INTELLIGENCE
    # =====================================================

    indicator_ids = [

        indicator.id

        for indicator in indicators

    ]


    threat_intelligence = []


    if indicator_ids:

        threat_intelligence = (
            ThreatIntelResult.query.filter(

                ThreatIntelResult.indicator_id.in_(
                    indicator_ids
                )

            ).order_by(

                ThreatIntelResult.checked_at.asc()

            ).all()
        )


    # =====================================================
    # GET MITRE ATT&CK MAPPINGS
    # =====================================================

    finding_ids = [

        finding.id

        for finding in findings

    ]


    mitre_mappings = []


    if finding_ids:

        mitre_mappings = (
            MitreAttackMapping.query.filter(

                MitreAttackMapping.finding_id.in_(
                    finding_ids
                )

            ).order_by(

                MitreAttackMapping.created_at.asc()

            ).all()
        )


    # =====================================================
    # BUILD RISK ASSESSMENT
    # =====================================================

    risk_assessment = (
        build_risk_assessment(
            case_id
        )
    )


    # =====================================================
    # BUILD EXECUTIVE SUMMARY
    # =====================================================

    executive_summary = (
        build_executive_summary(

            case=case,

            findings=findings,

            indicators=indicators,

            threat_intelligence=(
                threat_intelligence
            ),

            affected_users=(
                affected_users
            ),

            containment_actions=(
                containment_actions
            ),

            mitre_mappings=(
                mitre_mappings
            ),

            risk_assessment=(
                risk_assessment
            )

        )
    )


    # =====================================================
    # RETURN COMPLETE REPORT
    # =====================================================

    return jsonify({

        "report_type":
            "PhishTrace Incident Investigation Report",

        "generated_for_case":
            case.case_number,

        "case":
            case.to_dict(),

        "executive_summary":
            executive_summary,

        "risk_assessment":
            risk_assessment,

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

            for result in threat_intelligence

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
                len(threat_intelligence),

            "findings":
                len(findings),

            "affected_users":
                len(affected_users),

            "containment_actions":
                len(containment_actions),

            "mitre_mappings":
                len(mitre_mappings)

        }

    }), 200