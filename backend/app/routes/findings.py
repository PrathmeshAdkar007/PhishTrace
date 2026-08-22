from flask import Blueprint, jsonify

from app import db
from app.models.case import Case
from app.models.finding import Finding
from app.models.email import Email
from app.models.email_authentication import EmailAuthentication
from app.models.indicator import Indicator
from app.models.threat_intel_result import ThreatIntelResult


findings = Blueprint("findings", __name__)


# =========================================================
# GET ALL FINDINGS
# =========================================================

@findings.get("/api/findings")
def get_all_findings():

    findings_list = Finding.query.order_by(
        Finding.created_at.desc()
    ).all()

    return jsonify({
        "count": len(findings_list),
        "findings": [
            finding.to_dict()
            for finding in findings_list
        ]
    })


# =========================================================
# GET SINGLE FINDING
# =========================================================

@findings.get("/api/findings/<int:finding_id>")
def get_finding(finding_id):

    finding = db.session.get(
        Finding,
        finding_id
    )

    if not finding:
        return jsonify({
            "error": "Finding not found"
        }), 404

    return jsonify({
        "finding": finding.to_dict()
    })


# =========================================================
# GENERATE FINDINGS FOR A CASE
# =========================================================

@findings.post("/api/cases/<int:case_id>/generate-findings")
def generate_findings(case_id):

    case = db.session.get(
        Case,
        case_id
    )

    if not case:
        return jsonify({
            "error": "Case not found"
        }), 404

    emails = Email.query.filter_by(
        case_id=case_id
    ).all()

    if not emails:
        return jsonify({
            "error": "No emails found for this case"
        }), 404

    created_findings = []

    for email in emails:

        # ==================================================
        # 1. EMAIL AUTHENTICATION FINDINGS
        # ==================================================

        authentication = EmailAuthentication.query.filter_by(
            email_id=email.id
        ).first()

        if authentication:

            authentication_checks = [
                (
                    "SPF",
                    authentication.spf_result,
                    "SPF authentication failed for this email."
                ),
                (
                    "DKIM",
                    authentication.dkim_result,
                    "DKIM authentication failed for this email."
                ),
                (
                    "DMARC",
                    authentication.dmarc_result,
                    "DMARC authentication failed for this email."
                )
            ]

            for check_name, result, description in authentication_checks:

                if result and result.lower() == "fail":

                    existing = Finding.query.filter_by(
                        case_id=case_id,
                        finding_type="email_authentication",
                        title=f"{check_name} authentication failure"
                    ).first()

                    if existing:
                        continue

                    finding = Finding(
                        case_id=case_id,
                        finding_type="email_authentication",
                        title=f"{check_name} authentication failure",
                        description=description,
                        severity="high",
                        confidence="high",
                        evidence={
                            "email_id": email.id,
                            "result": result
                        },
                        analyst_notes=(
                            f"{check_name} returned a failure result "
                            "during email authentication analysis."
                        )
                    )

                    db.session.add(finding)
                    db.session.flush()

                    created_findings.append(
                        finding.to_dict()
                    )

        # ==================================================
        # 2. THREAT INTELLIGENCE FINDINGS
        # ==================================================

        indicators_list = Indicator.query.filter_by(
            email_id=email.id
        ).all()

        for indicator in indicators_list:

            intel_results = ThreatIntelResult.query.filter_by(
                indicator_id=indicator.id
            ).all()

            for intel in intel_results:

                if intel.verdict == "malicious":

                    existing = Finding.query.filter_by(
                        case_id=case_id,
                        finding_type="threat_intelligence",
                        title=f"Malicious indicator: {indicator.value}"
                    ).first()

                    if existing:
                        continue

                    finding = Finding(
                        case_id=case_id,
                        finding_type="threat_intelligence",
                        title=f"Malicious indicator: {indicator.value}",
                        description=(
                            f"The indicator {indicator.value} was classified "
                            "as malicious by the threat intelligence analysis."
                        ),
                        severity="critical",
                        confidence=intel.confidence or "high",
                        evidence={
                            "email_id": email.id,
                            "indicator_id": indicator.id,
                            "indicator_type": indicator.indicator_type,
                            "indicator_value": indicator.value,
                            "provider": intel.provider,
                            "verdict": intel.verdict,
                            "score": (
                                float(intel.score)
                                if intel.score is not None
                                else None
                            )
                        },
                        analyst_notes=intel.notes
                    )

                    db.session.add(finding)
                    db.session.flush()

                    created_findings.append(
                        finding.to_dict()
                    )

    db.session.commit()

    return jsonify({
        "message": "Findings generated successfully",
        "case_id": case_id,
        "count": len(created_findings),
        "findings": created_findings
    }), 201


# =========================================================
# GET FINDINGS FOR A CASE
# =========================================================

@findings.get("/api/cases/<int:case_id>/findings")
def get_case_findings(case_id):

    case = db.session.get(
        Case,
        case_id
    )

    if not case:
        return jsonify({
            "error": "Case not found"
        }), 404

    findings_list = Finding.query.filter_by(
        case_id=case_id
    ).order_by(
        Finding.created_at.desc()
    ).all()

    return jsonify({
        "case_id": case_id,
        "count": len(findings_list),
        "findings": [
            finding.to_dict()
            for finding in findings_list
        ]
    })