from flask import Blueprint, jsonify

from app import db

from app.models.case import Case
from app.models.email import Email
from app.models.indicator import Indicator
from app.models.finding import Finding
from app.models.affected_user import AffectedUser
from app.models.threat_intel_result import ThreatIntelResult

from app.routes.auth import login_required


campaigns = Blueprint(
    "campaigns",
    __name__
)


# =========================================================
# CAMPAIGN CORRELATION CONFIGURATION
# =========================================================

CORRELATION_THRESHOLD = 30


# =========================================================
# GET CAMPAIGN CORRELATION
# =========================================================

@campaigns.get(
    "/api/campaigns/correlate"
)
@login_required
def correlate_campaigns():

    # -----------------------------------------------------
    # GET ALL CASES
    # -----------------------------------------------------

    cases = Case.query.order_by(
        Case.created_at.asc()
    ).all()


    if not cases:

        return jsonify({

            "campaign_count": 0,

            "campaigns": [],

            "correlation_threshold":
                CORRELATION_THRESHOLD

        })


    # -----------------------------------------------------
    # BUILD CASE DATA
    # -----------------------------------------------------

    case_data = {}


    for case in cases:

        emails = Email.query.filter_by(
            case_id=case.id
        ).all()


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


        findings = Finding.query.filter_by(
            case_id=case.id
        ).all()


        affected_users = AffectedUser.query.filter_by(
            case_id=case.id
        ).all()


        case_data[case.id] = {

            "case": case,

            "emails": emails,

            "email_ids": email_ids,

            "indicators": indicators,

            "findings": findings,

            "affected_users":
                affected_users

        }


    # -----------------------------------------------------
    # COMPARE CASES
    # -----------------------------------------------------

    campaigns_found = []


    processed_pairs = set()


    for index, case_a in enumerate(cases):

        for case_b in cases[index + 1:]:

            pair = tuple(
                sorted(
                    [
                        case_a.id,
                        case_b.id
                    ]
                )
            )


            if pair in processed_pairs:
                continue


            processed_pairs.add(pair)


            data_a = case_data[
                case_a.id
            ]

            data_b = case_data[
                case_b.id
            ]


            # =================================================
            # COMMON INDICATORS
            # =================================================

            indicators_a = {
                (
                    indicator.indicator_type,
                    indicator.value.lower().strip()
                )
                for indicator in data_a["indicators"]
                if indicator.value
            }


            indicators_b = {
                (
                    indicator.indicator_type,
                    indicator.value.lower().strip()
                )
                for indicator in data_b["indicators"]
                if indicator.value
            }


            common_indicator_keys = (
                indicators_a
                & indicators_b
            )


            common_indicators = []


            for indicator_type, value in sorted(
                common_indicator_keys
            ):

                common_indicators.append({

                    "type":
                        indicator_type,

                    "value":
                        value

                })


            # =================================================
            # EMAIL SIMILARITY
            # =================================================

            email_score = 0


            senders_a = {
                email.sender.lower().strip()
                for email in data_a["emails"]
                if email.sender
            }


            senders_b = {
                email.sender.lower().strip()
                for email in data_b["emails"]
                if email.sender
            }


            if senders_a & senders_b:

                email_score += 10


            # =================================================
            # INDICATOR SCORE
            # =================================================

            indicator_score = min(
                len(common_indicators) * 30,
                30
            )


            # =================================================
            # FINDING SCORE
            # =================================================

            finding_score = 0


            if (
                data_a["findings"]
                and data_b["findings"]
            ):

                finding_score = 10


            # =================================================
            # TOTAL CORRELATION SCORE
            # =================================================

            correlation_score = min(
                indicator_score
                + email_score
                + finding_score,
                100
            )


            # -------------------------------------------------
            # ONLY CREATE CAMPAIGN IF THRESHOLD IS MET
            # -------------------------------------------------

            if (
                correlation_score
                < CORRELATION_THRESHOLD
            ):

                continue


            # =================================================
            # CAMPAIGN ID
            # =================================================

            campaign_id = (
                f"CAMP-{len(campaigns_found) + 1:04d}"
            )


            # =================================================
            # RELATED EMAILS
            # =================================================

            related_emails = []


            for email in (
                data_a["emails"]
                + data_b["emails"]
            ):

                related_emails.append(
                    email.to_dict()
                )


            # =================================================
            # RISK BREAKDOWN
            # =================================================

            correlation_risk = min(
                round(
                    correlation_score
                    * 0.25
                ),
                25
            )


            findings_risk = min(
                (
                    len(data_a["findings"])
                    + len(data_b["findings"])
                ) * 5,
                30
            )


            threat_intel_risk = 0


            indicator_ids = [
                indicator.id
                for indicator in (
                    data_a["indicators"]
                    + data_b["indicators"]
                )
            ]


            if indicator_ids:

                intel_results = (
                    ThreatIntelResult.query.filter(
                        ThreatIntelResult.indicator_id.in_(
                            indicator_ids
                        )
                    ).all()
                )


                malicious_count = sum(
                    1
                    for result in intel_results
                    if result.verdict == "malicious"
                )


                threat_intel_risk = min(
                    malicious_count * 7,
                    25
                )


            # =================================================
            # USER IMPACT RISK
            # =================================================

            affected_user_count = (
                len(data_a["affected_users"])
                + len(data_b["affected_users"])
            )


            user_impact_risk = min(
                affected_user_count * 2,
                20
            )


            total_risk = min(
                correlation_risk
                + findings_risk
                + threat_intel_risk
                + user_impact_risk,
                100
            )


            # =================================================
            # CORRELATION CLASSIFICATION
            # =================================================

            if correlation_score >= 70:

                correlation = "strong"

            elif correlation_score >= 50:

                correlation = "probable"

            else:

                correlation = "possible"


            # =================================================
            # REASONS
            # =================================================

            reasons = []


            if common_indicators:

                reason_text = (
                    "Both emails contain the same "
                    "indicator."
                    if len(common_indicators) == 1
                    else
                    "Both cases contain common "
                    "indicators."
                )

                reasons.append(
                    reason_text
                )


            if senders_a & senders_b:

                reasons.append(
                    "Both cases contain emails "
                    "from the same sender."
                )


            if (
                data_a["findings"]
                and data_b["findings"]
            ):

                reasons.append(
                    "Both investigations contain "
                    "security findings."
                )


            if not reasons:

                reasons.append(
                    "Cases share characteristics "
                    "associated with the same "
                    "phishing activity."
                )


            # =================================================
            # CREATE CAMPAIGN RESULT
            # =================================================

            campaigns_found.append({

                "campaign_id":
                    campaign_id,

                "case_count":
                    2,

                "cases": [
                    case_a.id,
                    case_b.id
                ],

                "emails":
                    related_emails,

                "email_count":
                    len(related_emails),

                "common_indicators":
                    common_indicators,

                "finding_count": (
                    len(data_a["findings"])
                    + len(data_b["findings"])
                ),

                "affected_user_count":
                    affected_user_count,

                "correlation_score":
                    correlation_score,

                "correlation":
                    correlation,

                "reasons":
                    reasons,

                "risk_breakdown": {

                    "correlation":
                        correlation_risk,

                    "findings":
                        findings_risk,

                    "threat_intelligence":
                        threat_intel_risk,

                    "user_impact":
                        user_impact_risk

                },

                "risk_score":
                    total_risk

            })


    # =========================================================
    # RESPONSE
    # =========================================================

    return jsonify({

        "campaign_count":
            len(campaigns_found),

        "campaigns":
            campaigns_found,

        "correlation_threshold":
            CORRELATION_THRESHOLD

    })