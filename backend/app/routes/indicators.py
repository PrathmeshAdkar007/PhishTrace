import re
from datetime import datetime

from flask import Blueprint, jsonify

from app import db
from app.models.email import Email
from app.models.indicator import Indicator
from app.routes.auth import login_required


indicators = Blueprint(
    "indicators",
    __name__
)


# =========================================================
# INDICATOR PATTERNS
# =========================================================

URL_PATTERN = re.compile(
    r"https?://[^\s<>'\"]+",
    re.IGNORECASE
)


IP_PATTERN = re.compile(
    r"\b(?:\d{1,3}\.){3}\d{1,3}\b"
)


DOMAIN_PATTERN = re.compile(
    r"\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b"
)


HASH_PATTERN = re.compile(
    r"\b[a-fA-F0-9]{32}\b"
    r"|\b[a-fA-F0-9]{40}\b"
    r"|\b[a-fA-F0-9]{64}\b"
)


# =========================================================
# EXTRACT INDICATORS FROM EMAIL
# =========================================================

@indicators.post(
    "/api/emails/<int:email_id>/extract-indicators"
)
@login_required
def extract_indicators(email_id):

    email = db.session.get(
        Email,
        email_id
    )


    if not email:

        return jsonify({
            "error": "Email not found"
        }), 404


    raw_email = email.raw_email or ""


    urls = URL_PATTERN.findall(
        raw_email
    )

    ips = IP_PATTERN.findall(
        raw_email
    )

    domains = DOMAIN_PATTERN.findall(
        raw_email
    )

    hashes = HASH_PATTERN.findall(
        raw_email
    )


    extracted = []


    # =====================================================
    # SAVE INDICATOR
    # =====================================================

    def save_indicator(
        indicator_type,
        value
    ):

        if not value:
            return


        existing = Indicator.query.filter_by(

            email_id=email_id,

            indicator_type=indicator_type,

            value=value

        ).first()


        if existing:

            extracted.append(
                existing.to_dict()
            )

            return


        now = datetime.utcnow()


        indicator = Indicator(

            email_id=email_id,

            indicator_type=indicator_type,

            value=value,

            source="email_parser",

            confidence="medium",

            first_seen=now,

            last_seen=now,

            notes=(
                "Extracted automatically "
                "from email content."
            )

        )


        db.session.add(
            indicator
        )

        db.session.flush()


        extracted.append(
            indicator.to_dict()
        )


    # =====================================================
    # EXTRACT URLs
    # =====================================================

    for url in urls:

        save_indicator(
            "url",
            url
        )


    # =====================================================
    # EXTRACT IPs
    # =====================================================

    for ip in ips:

        save_indicator(
            "ip",
            ip
        )


    # =====================================================
    # EXTRACT DOMAINS
    # =====================================================

    for domain in domains:

        save_indicator(
            "domain",
            domain
        )


    # =====================================================
    # EXTRACT HASHES
    # =====================================================

    for file_hash in hashes:

        save_indicator(
            "hash",
            file_hash
        )


    # =====================================================
    # SAVE
    # =====================================================

    try:

        db.session.commit()

    except Exception:

        db.session.rollback()

        return jsonify({
            "error":
                "Failed to save extracted indicators"
        }), 500


    return jsonify({

        "message":
            "Indicator extraction completed",

        "email_id":
            email_id,

        "count":
            len(extracted),

        "indicators":
            extracted

    })


# =========================================================
# GET INDICATORS FOR EMAIL
# =========================================================

@indicators.get(
    "/api/emails/<int:email_id>/indicators"
)
@login_required
def get_email_indicators(email_id):

    email = db.session.get(
        Email,
        email_id
    )


    if not email:

        return jsonify({
            "error": "Email not found"
        }), 404


    indicator_list = Indicator.query.filter_by(
        email_id=email_id
    ).order_by(
        Indicator.first_seen.asc()
    ).all()


    return jsonify({

        "email_id":
            email_id,

        "count":
            len(indicator_list),

        "indicators": [

            indicator.to_dict()

            for indicator in indicator_list

        ]

    })