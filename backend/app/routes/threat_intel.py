from datetime import datetime

from flask import Blueprint, jsonify

from app import db
from app.models.indicator import Indicator
from app.models.threat_intel_result import ThreatIntelResult


threat_intel = Blueprint(
    "threat_intel",
    __name__
)


# =========================================================
# LOCAL THREAT INTELLIGENCE ANALYSIS
# =========================================================

def analyze_indicator(indicator):
    """
    Local/mock threat intelligence analysis.

    This is intentionally a local provider for now.
    Later we can replace this with real providers/APIs.
    """

    value = indicator.value.lower()

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
            "IP address requires threat intelligence verification."
        )


    # =====================================================
    # URL ANALYSIS
    # =====================================================

    elif indicator.indicator_type == "url":

        suspicious = True

        reason = (
            "URL requires reputation and sandbox verification."
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
            "verdict": "malicious",
            "score": 90.0,
            "confidence": "high",
            "reason": reason
        }


    return {
        "verdict": "unknown",
        "score": 20.0,
        "confidence": "low",
        "reason": reason
    }


# =========================================================
# ANALYZE SINGLE INDICATOR
# =========================================================

@threat_intel.post(
    "/api/indicators/<int:indicator_id>/threat-intel"
)
def analyze_indicator_threat_intel(indicator_id):

    indicator = db.session.get(
        Indicator,
        indicator_id
    )


    if not indicator:

        return jsonify({
            "error": "Indicator not found"
        }), 404


    # =====================================================
    # CHECK EXISTING RESULT
    # =====================================================

    existing = ThreatIntelResult.query.filter_by(
        indicator_id=indicator_id,
        provider="local"
    ).first()


    if existing:

        return jsonify({

            "message":
                "Threat intelligence result already exists",

            "result":
                existing.to_dict()

        }), 200


    # =====================================================
    # RUN ANALYSIS
    # =====================================================

    analysis = analyze_indicator(
        indicator
    )


    # =====================================================
    # CREATE RESULT
    # =====================================================

    result = ThreatIntelResult(

        indicator_id=indicator_id,

        provider="local",

        verdict=analysis["verdict"],

        score=analysis["score"],

        confidence=analysis["confidence"],

        raw_response={

            "provider": "local",

            "indicator":
                indicator.value,

            "indicator_type":
                indicator.indicator_type,

            "analysis":
                analysis

        },

        checked_at=datetime.utcnow(),

        notes=analysis["reason"]
    )


    db.session.add(result)

    db.session.commit()


    return jsonify({

        "message":
            "Threat intelligence analysis completed",

        "result":
            result.to_dict()

    }), 201


# =========================================================
# GET THREAT INTELLIGENCE FOR SINGLE INDICATOR
# =========================================================

@threat_intel.get(
    "/api/indicators/<int:indicator_id>/threat-intel"
)
def get_indicator_threat_intel(indicator_id):

    indicator = db.session.get(
        Indicator,
        indicator_id
    )


    if not indicator:

        return jsonify({
            "error": "Indicator not found"
        }), 404


    results = ThreatIntelResult.query.filter_by(
        indicator_id=indicator_id
    ).order_by(
        ThreatIntelResult.checked_at.desc()
    ).all()


    return jsonify({

        "indicator_id":
            indicator_id,

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