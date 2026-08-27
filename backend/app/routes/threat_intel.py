import os
import base64

import requests

from datetime import datetime

from flask import Blueprint, jsonify

from app import db

from app.models.indicator import Indicator

from app.models.email import Email

from app.models.finding import Finding

from app.models.threat_intel_result import (
    ThreatIntelResult
)

from app.routes.auth import login_required


threat_intel = Blueprint(
    "threat_intel",
    __name__
)


# =========================================================
# VIRUSTOTAL CONFIGURATION
# =========================================================

VIRUSTOTAL_API_URL = (
    "https://www.virustotal.com/api/v3"
)


def get_virustotal_api_key():

    return os.getenv(
        "VIRUSTOTAL_API_KEY"
    )


# =========================================================
# LOCAL FALLBACK ANALYSIS
# =========================================================

def analyze_indicator_local(indicator):

    value = (
        indicator.value or ""
    ).lower()


    suspicious_domains = [

        "micr0soft-support.com",

        "micros0ft-support.com",

        "microsoft-security-alert.com"

    ]


    suspicious = False


    reason = (
        "No obvious threat indicators detected."
    )


    # =====================================================
    # DOMAIN ANALYSIS
    # =====================================================

    if indicator.indicator_type == "domain":

        if value in suspicious_domains:

            suspicious = True

            reason = (
                "Domain uses a suspicious lookalike pattern "
                "associated with phishing."
            )

        elif any(

            keyword in value

            for keyword in [

                "login",

                "verify",

                "security",

                "support",

                "account",

                "password"

            ]

        ):

            suspicious = True

            reason = (
                "Domain contains keywords commonly associated "
                "with phishing or credential harvesting."
            )


    # =====================================================
    # IP ANALYSIS
    # =====================================================

    elif indicator.indicator_type == "ip":

        suspicious = True

        reason = (
            "IP address requires external threat intelligence "
            "verification."
        )


    # =====================================================
    # URL ANALYSIS
    # =====================================================

    elif indicator.indicator_type == "url":

        suspicious = True

        reason = (
            "URL requires reputation and security verification."
        )


    # =====================================================
    # HASH ANALYSIS
    # =====================================================

    elif indicator.indicator_type == "hash":

        reason = (
            "File hash requires malware reputation verification."
        )


    # =====================================================
    # RESULT
    # =====================================================

    if suspicious:

        return {

            "verdict":
                "suspicious",

            "score":
                70.0,

            "confidence":
                "medium",

            "reason":
                reason

        }


    return {

        "verdict":
            "unknown",

        "score":
            20.0,

        "confidence":
            "low",

        "reason":
            reason

    }


# =========================================================
# GET VIRUSTOTAL ENDPOINT
# =========================================================

def get_virustotal_endpoint(indicator):

    indicator_type = (
        indicator.indicator_type or ""
    ).lower()

    value = (
        indicator.value or ""
    ).strip()


    # =====================================================
    # DOMAIN
    # =====================================================

    if indicator_type == "domain":

        return (
            f"{VIRUSTOTAL_API_URL}/domains/"
            f"{value}"
        )


    # =====================================================
    # IP ADDRESS
    # =====================================================

    if indicator_type == "ip":

        return (
            f"{VIRUSTOTAL_API_URL}/ip_addresses/"
            f"{value}"
        )


    # =====================================================
    # FILE HASH
    # =====================================================

    if indicator_type == "hash":

        return (
            f"{VIRUSTOTAL_API_URL}/files/"
            f"{value}"
        )


    # =====================================================
    # URL
    # =====================================================

    if indicator_type == "url":

        encoded_url = base64.urlsafe_b64encode(

            value.encode(
                "utf-8"
            )

        ).decode(
            "utf-8"
        ).rstrip(
            "="
        )


        return (
            f"{VIRUSTOTAL_API_URL}/urls/"
            f"{encoded_url}"
        )


    return None


# =========================================================
# CONVERT VIRUSTOTAL RESPONSE
# =========================================================

def analyze_virustotal_response(response_data):

    attributes = (

        response_data
        .get("data", {})
        .get("attributes", {})

    )


    stats = attributes.get(

        "last_analysis_stats",

        {}

    )


    malicious = int(

        stats.get(
            "malicious",
            0
        )

    )


    suspicious = int(

        stats.get(
            "suspicious",
            0
        )

    )


    harmless = int(

        stats.get(
            "harmless",
            0
        )

    )


    undetected = int(

        stats.get(
            "undetected",
            0
        )

    )


    timeout = int(

        stats.get(
            "timeout",
            0
        )

    )


    total = (

        malicious

        + suspicious

        + harmless

        + undetected

        + timeout

    )


    # =====================================================
    # CALCULATE RISK SCORE
    # =====================================================

    if total > 0:

        score = (

            (
                malicious * 100

                + suspicious * 70
            )

            / total

        )

    else:

        score = 0.0


    score = round(

        min(
            100.0,
            score
        ),

        2

    )


    # =====================================================
    # DETERMINE VERDICT
    # =====================================================

    if malicious > 0:

        verdict = "malicious"

    elif suspicious > 0:

        verdict = "suspicious"

    elif harmless > 0:

        verdict = "clean"

    else:

        verdict = "unknown"


    # =====================================================
    # DETERMINE CONFIDENCE
    # =====================================================

    if malicious >= 3:

        confidence = "high"

    elif malicious > 0:

        confidence = "medium"

    elif suspicious > 0:

        confidence = "medium"

    else:

        confidence = "low"


    reason = (

        f"VirusTotal detected "

        f"{malicious} malicious and "

        f"{suspicious} suspicious results "

        f"out of {total} completed checks."

    )


    return {

        "verdict":
            verdict,

        "score":
            score,

        "confidence":
            confidence,

        "reason":
            reason,

        "stats": {

            "malicious":
                malicious,

            "suspicious":
                suspicious,

            "harmless":
                harmless,

            "undetected":
                undetected,

            "timeout":
                timeout,

            "total":
                total

        }

    }


# =========================================================
# VIRUSTOTAL LOOKUP
# =========================================================

def analyze_indicator_virustotal(indicator):

    api_key = get_virustotal_api_key()


    if not api_key:

        return {

            "success":
                False,

            "error":
                "VirusTotal API key is not configured."

        }


    endpoint = get_virustotal_endpoint(
        indicator
    )


    if not endpoint:

        return {

            "success":
                False,

            "error":
                "Unsupported indicator type."

        }


    headers = {

        "x-apikey":
            api_key

    }


    try:

        response = requests.get(

            endpoint,

            headers=headers,

            timeout=15

        )


    except requests.RequestException as error:

        return {

            "success":
                False,

            "error":
                f"VirusTotal request failed: {str(error)}"

        }


    # =====================================================
    # API ERROR
    # =====================================================

    if response.status_code != 200:

        return {

            "success":
                False,

            "status_code":
                response.status_code,

            "error":
                "VirusTotal did not return a report."

        }


    try:

        response_data = response.json()

    except ValueError:

        return {

            "success":
                False,

            "error":
                "Invalid response received from VirusTotal."

        }


    analysis = analyze_virustotal_response(
        response_data
    )


    return {

        "success":
            True,

        "analysis":
            analysis,

        "raw_response":
            response_data

    }


# =========================================================
# DETERMINE FINDING SEVERITY
# =========================================================

def get_finding_severity(score):

    score = float(
        score or 0
    )


    if score >= 90:

        return "critical"


    if score >= 70:

        return "high"


    if score >= 40:

        return "medium"


    return "low"


# =========================================================
# CREATE FINDING FOR MALICIOUS INDICATOR
# =========================================================

def create_malicious_indicator_finding(

    indicator,

    analysis,

    provider,

    threat_result_id=None

):

    # =====================================================
    # FIND RELATED EMAIL
    # =====================================================

    email = db.session.get(

        Email,

        indicator.email_id

    )


    if not email:

        return None


    # =====================================================
    # PREVENT DUPLICATE FINDINGS
    # =====================================================

    existing_finding = Finding.query.filter_by(

        case_id=email.case_id,

        finding_type="malicious_indicator"

    ).filter(

        Finding.evidence["indicator_id"].as_string()

        == str(indicator.id)

    ).first()


    if existing_finding:

        return existing_finding


    # =====================================================
    # CREATE FINDING
    # =====================================================

    severity = get_finding_severity(

        analysis.get(
            "score"
        )

    )


    title = (

        f"Malicious {indicator.indicator_type.upper()} "

        f"Indicator Detected"
    )


    description = (

        f"The {indicator.indicator_type} indicator "

        f"'{indicator.value}' was classified as malicious "

        f"by {provider}. "

        f"Threat score: {analysis.get('score', 0)}. "

        f"{analysis.get('reason', '')}"
    )


    evidence = {

        "indicator_id":
            indicator.id,

        "indicator_type":
            indicator.indicator_type,

        "indicator_value":
            indicator.value,

        "email_id":
            indicator.email_id,

        "case_id":
            email.case_id,

        "provider":
            provider,

        "threat_intel_result_id":
            threat_result_id,

        "verdict":
            analysis.get(
                "verdict"
            ),

        "score":
            analysis.get(
                "score"
            ),

        "confidence":
            analysis.get(
                "confidence"
            ),

        "analysis_stats":
            analysis.get(
                "stats",
                {}
            )

    }


    finding = Finding(

        case_id=
            email.case_id,

        finding_type=
            "malicious_indicator",

        title=
            title,

        description=
            description,

        severity=
            severity,

        confidence=
            analysis.get(
                "confidence"
            ),

        evidence=
            evidence,

        analyst_notes=
            (
                "Automatically created from threat "
                "intelligence analysis."
            )

    )


    db.session.add(
        finding
    )


    return finding


# =========================================================
# ANALYZE SINGLE INDICATOR
# =========================================================

@threat_intel.post(
    "/api/indicators/<int:indicator_id>/threat-intel"
)

@login_required

def analyze_indicator_threat_intel(
    indicator_id
):

    indicator = db.session.get(

        Indicator,

        indicator_id

    )


    if not indicator:

        return jsonify({

            "error":
                "Indicator not found"

        }), 404


    # =====================================================
    # CHECK EXISTING VIRUSTOTAL RESULT
    # =====================================================

    existing = ThreatIntelResult.query.filter_by(

        indicator_id=indicator_id,

        provider="virustotal"

    ).first()


    if existing:

        return jsonify({

            "message":
                "VirusTotal result already exists",

            "result":
                existing.to_dict()

        }), 200


    # =====================================================
    # RUN VIRUSTOTAL ANALYSIS
    # =====================================================

    vt_result = analyze_indicator_virustotal(
        indicator
    )


    # =====================================================
    # USE VIRUSTOTAL RESULT
    # =====================================================

    if vt_result.get(
        "success"
    ):

        analysis = vt_result[
            "analysis"
        ]


        provider = (
            "virustotal"
        )


        raw_response = vt_result[
            "raw_response"
        ]


        notes = analysis[
            "reason"
        ]


    # =====================================================
    # LOCAL FALLBACK
    # =====================================================

    else:

        analysis = analyze_indicator_local(
            indicator
        )


        provider = (
            "local"
        )


        raw_response = {

            "provider":
                "local_fallback",

            "indicator":
                indicator.value,

            "indicator_type":
                indicator.indicator_type,

            "error":
                vt_result.get(
                    "error"
                ),

            "analysis":
                analysis

        }


        notes = (

            analysis[
                "reason"
            ]

            + " "

            + "Real-time provider unavailable: "

            + str(

                vt_result.get(
                    "error"
                )

            )

        )


    # =====================================================
    # CREATE THREAT INTELLIGENCE RESULT
    # =====================================================

    result = ThreatIntelResult(

        indicator_id=
            indicator_id,

        provider=
            provider,

        verdict=
            analysis[
                "verdict"
            ],

        score=
            analysis[
                "score"
            ],

        confidence=
            analysis[
                "confidence"
            ],

        raw_response=
            raw_response,

        checked_at=
            datetime.utcnow(),

        notes=
            notes

    )


    try:

        db.session.add(
            result
        )


        # Flush so the result gets an ID before
        # we add it to the Finding evidence.

        db.session.flush()


        # =================================================
        # CREATE FINDING FOR MALICIOUS RESULT
        # =================================================

        finding = None


        if analysis.get(
            "verdict"
        ) == "malicious":

            finding = create_malicious_indicator_finding(

                indicator=
                    indicator,

                analysis=
                    analysis,

                provider=
                    provider,

                threat_result_id=
                    result.id

            )


        # =================================================
        # COMMIT EVERYTHING TOGETHER
        # =================================================

        db.session.commit()


    except Exception:

        db.session.rollback()

        return jsonify({

            "error":
                "Failed to save threat intelligence result"

        }), 500


    response_data = {

        "message":
            "Threat intelligence analysis completed",

        "provider":
            provider,

        "result":
            result.to_dict()

    }


    # =====================================================
    # INCLUDE CREATED FINDING
    # =====================================================

    if finding:

        response_data[
            "finding"
        ] = finding.to_dict()


    return jsonify(

        response_data

    ), 201


# =========================================================
# GET THREAT INTELLIGENCE FOR SINGLE INDICATOR
# =========================================================

@threat_intel.get(
    "/api/indicators/<int:indicator_id>/threat-intel"
)

@login_required

def get_indicator_threat_intel(
    indicator_id
):

    indicator = db.session.get(

        Indicator,

        indicator_id

    )


    if not indicator:

        return jsonify({

            "error":
                "Indicator not found"

        }), 404


    results = ThreatIntelResult.query.filter_by(

        indicator_id=
            indicator_id

    ).order_by(

        ThreatIntelResult.checked_at.desc()

    ).all()


    return jsonify({

        "indicator_id":
            indicator_id,

        "indicator":
            indicator.value,

        "indicator_type":
            indicator.indicator_type,

        "count":
            len(results),

        "results": [

            result.to_dict()

            for result in results

        ]

    })


# =========================================================
# GET ALL THREAT INTELLIGENCE RESULTS
# =========================================================

@threat_intel.get(
    "/api/threat-intelligence"
)

@login_required

def get_all_threat_intelligence():

    results = ThreatIntelResult.query.order_by(

        ThreatIntelResult.checked_at.desc()

    ).all()


    return jsonify({

        "count":
            len(results),

        "results": [

            result.to_dict()

            for result in results

        ]

    })