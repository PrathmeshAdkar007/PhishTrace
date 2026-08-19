from flask import Blueprint, jsonify

from app import db
from app.models.case import Case
from app.models.finding import Finding


risk = Blueprint("risk", __name__)


SEVERITY_SCORES = {
    "critical": 40,
    "high": 25,
    "medium": 15,
    "low": 5
}


def calculate_risk(findings_list):
    score = 0

    for finding in findings_list:
        severity = (finding.severity or "low").lower()
        score += SEVERITY_SCORES.get(severity, 0)

    # Cap the score at 100
    score = min(score, 100)

    if score >= 80:
        severity = "critical"
    elif score >= 60:
        severity = "high"
    elif score >= 30:
        severity = "medium"
    else:
        severity = "low"

    return score, severity


@risk.post("/api/cases/<int:case_id>/risk-assessment")
def assess_case_risk(case_id):
    case = db.session.get(Case, case_id)

    if not case:
        return jsonify({
            "error": "Case not found"
        }), 404

    findings_list = Finding.query.filter_by(
        case_id=case_id
    ).all()

    if not findings_list:
        return jsonify({
            "error": "No findings available for risk assessment"
        }), 404

    score, severity = calculate_risk(findings_list)

    critical_count = sum(
        1
        for finding in findings_list
        if finding.severity.lower() == "critical"
    )

    high_count = sum(
        1
        for finding in findings_list
        if finding.severity.lower() == "high"
    )

    medium_count = sum(
        1
        for finding in findings_list
        if finding.severity.lower() == "medium"
    )

    low_count = sum(
        1
        for finding in findings_list
        if finding.severity.lower() == "low"
    )

    return jsonify({
        "case_id": case_id,
        "risk_score": score,
        "risk_severity": severity,
        "finding_count": len(findings_list),
        "breakdown": {
            "critical": critical_count,
            "high": high_count,
            "medium": medium_count,
            "low": low_count
        },
        "summary": (
            f"Case contains {len(findings_list)} findings. "
            f"Overall risk is {severity} with a score of {score}/100."
        )
    })