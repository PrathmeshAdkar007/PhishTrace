from flask import Blueprint, jsonify

from app import db
from app.models.case import Case
from app.models.finding import Finding
from app.routes.auth import login_required


risk = Blueprint(
    "risk",
    __name__
)


# =========================================================
# RISK SCORES
# =========================================================

SEVERITY_SCORES = {
    "critical": 40,
    "high": 25,
    "medium": 15,
    "low": 5
}


# =========================================================
# CALCULATE RISK
# =========================================================

def calculate_risk(findings_list):

    score = 0


    for finding in findings_list:

        severity = (
            finding.severity or "low"
        ).lower()

        score += SEVERITY_SCORES.get(
            severity,
            0
        )


    # =====================================================
    # CAP SCORE
    # =====================================================

    score = min(
        score,
        100
    )


    # =====================================================
    # DETERMINE RISK SEVERITY
    # =====================================================

    if score >= 80:

        severity = "critical"

    elif score >= 60:

        severity = "high"

    elif score >= 30:

        severity = "medium"

    else:

        severity = "low"


    return score, severity


# =========================================================
# GET FINDING BREAKDOWN
# =========================================================

def get_finding_breakdown(findings_list):

    return {

        "critical": sum(
            1
            for finding in findings_list
            if (
                finding.severity or ""
            ).lower() == "critical"
        ),

        "high": sum(
            1
            for finding in findings_list
            if (
                finding.severity or ""
            ).lower() == "high"
        ),

        "medium": sum(
            1
            for finding in findings_list
            if (
                finding.severity or ""
            ).lower() == "medium"
        ),

        "low": sum(
            1
            for finding in findings_list
            if (
                finding.severity or ""
            ).lower() == "low"
        )

    }


# =========================================================
# BUILD RISK ASSESSMENT
# =========================================================

def build_risk_assessment(case_id):

    findings_list = Finding.query.filter_by(
        case_id=case_id
    ).all()


    # If there are no findings yet,
    # the case simply has zero risk.

    if not findings_list:

        return {

            "case_id": case_id,

            "risk_score": 0,

            "risk_severity": "low",

            "finding_count": 0,

            "breakdown": {

                "critical": 0,

                "high": 0,

                "medium": 0,

                "low": 0

            },

            "summary": (
                "No findings are currently available. "
                "Overall risk score is 0/100."
            )

        }


    # =====================================================
    # CALCULATE SCORE
    # =====================================================

    score, severity = calculate_risk(
        findings_list
    )


    breakdown = get_finding_breakdown(
        findings_list
    )


    # =====================================================
    # RESPONSE DATA
    # =====================================================

    return {

        "case_id": case_id,

        "risk_score": score,

        "risk_severity": severity,

        "finding_count": len(
            findings_list
        ),

        "breakdown": breakdown,

        "summary": (

            f"Case contains "
            f"{len(findings_list)} findings. "

            f"Overall risk is "
            f"{severity} with a score of "
            f"{score}/100."

        )

    }


# =========================================================
# GET CASE RISK ASSESSMENT
# =========================================================

@risk.get(
    "/api/cases/<int:case_id>/risk-assessment"
)
@login_required
def get_case_risk(case_id):

    case = db.session.get(
        Case,
        case_id
    )


    if not case:

        return jsonify({
            "error": "Case not found"
        }), 404


    assessment = build_risk_assessment(
        case_id
    )


    return jsonify(
        assessment
    )


# =========================================================
# MANUAL RISK ASSESSMENT
# =========================================================

@risk.post(
    "/api/cases/<int:case_id>/risk-assessment"
)
@login_required
def assess_case_risk(case_id):

    case = db.session.get(
        Case,
        case_id
    )


    if not case:

        return jsonify({
            "error": "Case not found"
        }), 404


    assessment = build_risk_assessment(
        case_id
    )


    return jsonify({

        "message":
            "Risk assessment completed",

        "assessment":
            assessment

    })