from flask import Blueprint, jsonify

from app import db

from app.models.case import Case
from app.models.finding import Finding
from app.models.email import Email
from app.models.email_authentication import EmailAuthentication
from app.models.indicator import Indicator
from app.models.threat_intel_result import ThreatIntelResult
from app.models.affected_user import AffectedUser

from app.routes.auth import login_required


risk = Blueprint(
    "risk",
    __name__
)


# =========================================================
# V2 RISK ENGINE
# =========================================================

MAX_FINDING_SCORE = 40
MAX_AUTHENTICATION_SCORE = 20
MAX_THREAT_INTEL_SCORE = 25
MAX_USER_IMPACT_SCORE = 15


FINDING_SCORES = {
    "critical": 20,
    "high": 15,
    "medium": 8,
    "low": 3
}


CONFIDENCE_MULTIPLIERS = {
    "high": 1.0,
    "medium": 0.75,
    "low": 0.5
}


# =========================================================
# RISK CLASSIFICATION
# =========================================================

def classify_risk(score):

    if score >= 75:
        return "critical"

    if score >= 50:
        return "high"

    if score >= 25:
        return "medium"

    return "low"


# =========================================================
# FINDING RISK
# =========================================================

def calculate_finding_score(findings_list):

    score = 0

    for finding in findings_list:

        severity = (
            finding.severity or "low"
        ).lower().strip()

        confidence = (
            finding.confidence or "medium"
        ).lower().strip()

        base_score = FINDING_SCORES.get(
            severity,
            0
        )

        multiplier = CONFIDENCE_MULTIPLIERS.get(
            confidence,
            0.75
        )

        score += base_score * multiplier

    return min(
        round(score),
        MAX_FINDING_SCORE
    )


# =========================================================
# EMAIL AUTHENTICATION RISK
# =========================================================

def calculate_authentication_score(
    authentication_results
):

    score = 0

    for authentication in authentication_results:

        if (
            authentication.spf_result
            and authentication.spf_result.lower() == "fail"
        ):
            score += 5

        if (
            authentication.dkim_result
            and authentication.dkim_result.lower() == "fail"
        ):
            score += 5

        if (
            authentication.dmarc_result
            and authentication.dmarc_result.lower() == "fail"
        ):
            score += 7

        if (
            authentication.dmarc_alignment
            and authentication.dmarc_alignment.lower()
            in ["fail", "misaligned"]
        ):
            score += 3

    return min(
        score,
        MAX_AUTHENTICATION_SCORE
    )


# =========================================================
# THREAT INTELLIGENCE RISK
# =========================================================

def calculate_threat_intel_score(
    threat_intel_results
):

    score = 0

    for result in threat_intel_results:

        verdict = (
            result.verdict or ""
        ).lower().strip()

        confidence = (
            result.confidence or "low"
        ).lower().strip()

        provider_score = (
            float(result.score)
            if result.score is not None
            else 0
        )

        if verdict == "malicious":

            if confidence == "high":
                score += 10

            elif confidence == "medium":
                score += 8

            else:
                score += 5

        elif provider_score >= 80:

            score += 7

        elif provider_score >= 60:

            score += 5

        elif provider_score >= 40:

            score += 2

    return min(
        score,
        MAX_THREAT_INTEL_SCORE
    )


# =========================================================
# USER IMPACT RISK
# =========================================================

def calculate_user_impact_score(
    affected_users
):

    score = 0

    for user in affected_users:

        if user.clicked_link:
            score += 3

        if user.submitted_credentials:
            score += 5

        if user.account_compromised:
            score += 7

    # Additional campaign scope signal.
    # This is deliberately small so that the
    # same user-impact evidence is not over-weighted.

    if len(affected_users) >= 5:
        score += 2

    return min(
        score,
        MAX_USER_IMPACT_SCORE
    )


# =========================================================
# COMPLETE RISK CALCULATION
# =========================================================

def calculate_risk(
    findings_list,
    authentication_results,
    threat_intel_results,
    affected_users
):

    finding_score = calculate_finding_score(
        findings_list
    )

    authentication_score = calculate_authentication_score(
        authentication_results
    )

    threat_intel_score = calculate_threat_intel_score(
        threat_intel_results
    )

    user_impact_score = calculate_user_impact_score(
        affected_users
    )

    total_score = (
        finding_score
        + authentication_score
        + threat_intel_score
        + user_impact_score
    )

    total_score = min(
        total_score,
        100
    )

    risk_severity = classify_risk(
        total_score
    )

    return {
        "risk_score": total_score,
        "risk_severity": risk_severity,
        "components": {
            "finding_score": finding_score,
            "authentication_score": authentication_score,
            "threat_intelligence_score": threat_intel_score,
            "user_impact_score": user_impact_score
        }
    }


# =========================================================
# CASE RISK ASSESSMENT
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


    # =====================================================
    # FINDINGS
    # =====================================================

    findings_list = Finding.query.filter_by(
        case_id=case_id
    ).all()


    if not findings_list:

        return jsonify({
            "error":
                "No findings available for risk assessment"
        }), 404


    # =====================================================
    # EMAILS
    # =====================================================

    emails = Email.query.filter_by(
        case_id=case_id
    ).all()


    email_ids = [
        email.id
        for email in emails
    ]


    # =====================================================
    # EMAIL AUTHENTICATION
    # =====================================================

    authentication_results = []

    if email_ids:

        authentication_results = (
            EmailAuthentication.query
            .filter(
                EmailAuthentication.email_id.in_(
                    email_ids
                )
            )
            .all()
        )


    # =====================================================
    # INDICATORS
    # =====================================================

    indicators = []

    if email_ids:

        indicators = (
            Indicator.query
            .filter(
                Indicator.email_id.in_(
                    email_ids
                )
            )
            .all()
        )


    indicator_ids = [
        indicator.id
        for indicator in indicators
    ]


    # =====================================================
    # THREAT INTELLIGENCE
    # =====================================================

    threat_intel_results = []

    if indicator_ids:

        threat_intel_results = (
            ThreatIntelResult.query
            .filter(
                ThreatIntelResult.indicator_id.in_(
                    indicator_ids
                )
            )
            .all()
        )


    # =====================================================
    # AFFECTED USERS
    # =====================================================

    affected_users = (
        AffectedUser.query
        .filter_by(
            case_id=case_id
        )
        .all()
    )


    # =====================================================
    # CALCULATE RISK
    # =====================================================

    risk_result = calculate_risk(

        findings_list,

        authentication_results,

        threat_intel_results,

        affected_users

    )


    # =====================================================
    # FINDING BREAKDOWN
    # =====================================================

    critical_count = sum(

        1

        for finding in findings_list

        if (
            finding.severity or ""
        ).lower() == "critical"

    )


    high_count = sum(

        1

        for finding in findings_list

        if (
            finding.severity or ""
        ).lower() == "high"

    )


    medium_count = sum(

        1

        for finding in findings_list

        if (
            finding.severity or ""
        ).lower() == "medium"

    )


    low_count = sum(

        1

        for finding in findings_list

        if (
            finding.severity or ""
        ).lower() == "low"

    )


    # =====================================================
    # RESPONSE
    # =====================================================

    return jsonify({

        "case_id":
            case_id,

        "risk_score":
            risk_result[
                "risk_score"
            ],

        "risk_severity":
            risk_result[
                "risk_severity"
            ],

        "risk_components":
            risk_result[
                "components"
            ],

        "finding_count":
            len(findings_list),

        "email_count":
            len(emails),

        "authentication_analysis_count":
            len(authentication_results),

        "indicator_count":
            len(indicators),

        "threat_intelligence_count":
            len(threat_intel_results),

        "affected_user_count":
            len(affected_users),

        "breakdown": {

            "critical":
                critical_count,

            "high":
                high_count,

            "medium":
                medium_count,

            "low":
                low_count

        },

        "summary": (

            f"Case contains "
            f"{len(findings_list)} findings, "
            f"{len(indicators)} indicators and "
            f"{len(affected_users)} affected users. "

            f"Overall risk is "
            f"{risk_result['risk_severity']} "
            f"with a score of "
            f"{risk_result['risk_score']}/100."

        )

    })