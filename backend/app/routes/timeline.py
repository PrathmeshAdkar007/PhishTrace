from flask import Blueprint, jsonify

from app import db

from app.models.case import Case
from app.models.email import Email
from app.models.email_authentication import EmailAuthentication
from app.models.indicator import Indicator
from app.models.threat_intel_result import ThreatIntelResult
from app.models.finding import Finding
from app.models.affected_user import AffectedUser
from app.models.containment_action import ContainmentAction
from app.models.mitre_attack_mapping import MitreAttackMapping

from app.routes.auth import login_required


timeline = Blueprint(
    "timeline",
    __name__
)


# =========================================================
# GET CASE INVESTIGATION TIMELINE
# =========================================================

@timeline.get(
    "/api/cases/<int:case_id>/timeline"
)
@login_required
def get_case_timeline(case_id):

    # -----------------------------------------------------
    # GET CASE
    # -----------------------------------------------------

    case = db.session.get(
        Case,
        case_id
    )

    if not case:

        return jsonify({
            "error": "Case not found"
        }), 404


    events = []


    # =====================================================
    # HELPER
    # =====================================================

    def add_event(
        timestamp,
        event_type,
        title,
        description,
        severity=None,
        source_id=None,
        metadata=None
    ):

        if not timestamp:
            return

        events.append({

            "timestamp":
                timestamp.isoformat(),

            "event_type":
                event_type,

            "title":
                title,

            "description":
                description,

            "severity":
                severity,

            "source_id":
                source_id,

            "metadata":
                metadata or {}

        })


    # =====================================================
    # CASE CREATED
    # =====================================================

    add_event(

        case.created_at,

        "case",

        "Case created",

        (
            f"Investigation case "
            f"{case.case_number} was created."
        ),

        severity=case.severity,

        source_id=case.id,

        metadata={
            "case_number":
                case.case_number,

            "status":
                case.status
        }

    )


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


    for email in emails:

        timestamp = (
            email.received_at
            or email.created_at
        )


        subject = (
            email.subject
            or "(No subject)"
        )


        add_event(

            timestamp,

            "email",

            "Email received",

            (
                f"Email received from "
                f"{email.sender} "
                f"with subject "
                f"\"{subject}\"."
            ),

            severity="medium",

            source_id=email.id,

            metadata={

                "email_id":
                    email.id,

                "sender":
                    email.sender,

                "recipient":
                    email.recipient,

                "subject":
                    email.subject,

                "message_id":
                    email.message_id

            }

        )


    # =====================================================
    # EMAIL AUTHENTICATION
    # =====================================================

    authentications = []


    if email_ids:

        authentications = (
            EmailAuthentication.query
            .filter(
                EmailAuthentication.email_id.in_(
                    email_ids
                )
            )
            .all()
        )


    for authentication in authentications:

        verdict = (
            authentication.authentication_verdict
            or "unknown"
        )


        verdict_lower = verdict.lower()


        if verdict_lower in [
            "fail",
            "failed",
            "suspicious",
            "malicious"
        ]:

            severity = "high"

        elif verdict_lower in [
            "pass",
            "passed",
            "legitimate"
        ]:

            severity = "low"

        else:

            severity = "medium"


        add_event(

            authentication.checked_at,

            "email_authentication",

            "Email authentication analysed",

            (
                f"Authentication verdict: "
                f"{verdict}. "
                f"SPF: "
                f"{authentication.spf_result or 'unknown'}, "
                f"DKIM: "
                f"{authentication.dkim_result or 'unknown'}, "
                f"DMARC: "
                f"{authentication.dmarc_result or 'unknown'}."
            ),

            severity=severity,

            source_id=authentication.id,

            metadata={

                "email_id":
                    authentication.email_id,

                "spf":
                    authentication.spf_result,

                "dkim":
                    authentication.dkim_result,

                "dmarc":
                    authentication.dmarc_result,

                "dmarc_alignment":
                    authentication.dmarc_alignment,

                "verdict":
                    authentication.authentication_verdict

            }

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


    for indicator in indicators:

        add_event(

            indicator.created_at,

            "indicator",

            "Indicator extracted",

            (
                f"{indicator.indicator_type.upper()} "
                f"indicator extracted: "
                f"{indicator.value}."
            ),

            severity="medium",

            source_id=indicator.id,

            metadata={

                "indicator_id":
                    indicator.id,

                "email_id":
                    indicator.email_id,

                "indicator_type":
                    indicator.indicator_type,

                "value":
                    indicator.value,

                "source":
                    indicator.source,

                "confidence":
                    indicator.confidence

            }

        )


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


    for result in threat_intel_results:

        verdict = (
            result.verdict
            or "unknown"
        )


        verdict_lower = verdict.lower()


        if verdict_lower == "malicious":

            severity = "critical"

        elif verdict_lower in [
            "suspicious",
            "likely_malicious"
        ]:

            severity = "high"

        elif verdict_lower in [
            "unknown"
        ]:

            severity = "medium"

        else:

            severity = "low"


        add_event(

            result.checked_at,

            "threat_intelligence",

            "Threat intelligence checked",

            (
                f"Threat intelligence provider "
                f"{result.provider} returned "
                f"verdict "
                f"{verdict}."
            ),

            severity=severity,

            source_id=result.id,

            metadata={

                "indicator_id":
                    result.indicator_id,

                "provider":
                    result.provider,

                "verdict":
                    result.verdict,

                "score":
                    (
                        float(result.score)
                        if result.score is not None
                        else None
                    ),

                "confidence":
                    result.confidence,

                "notes":
                    result.notes

            }

        )


    # =====================================================
    # FINDINGS
    # =====================================================

    findings = Finding.query.filter_by(
        case_id=case_id
    ).all()


    finding_ids = [
        finding.id
        for finding in findings
    ]


    for finding in findings:

        add_event(

            finding.created_at,

            "finding",

            finding.title,

            finding.description,

            severity=(
                finding.severity
                or "medium"
            ),

            source_id=finding.id,

            metadata={

                "finding_id":
                    finding.id,

                "finding_type":
                    finding.finding_type,

                "confidence":
                    finding.confidence,

                "evidence":
                    finding.evidence

            }

        )


    # =====================================================
    # MITRE ATT&CK MAPPINGS
    # =====================================================

    mitre_mappings = []


    if finding_ids:

        mitre_mappings = (
            MitreAttackMapping.query
            .filter(
                MitreAttackMapping.finding_id.in_(
                    finding_ids
                )
            )
            .all()
        )


    for mapping in mitre_mappings:

        add_event(

            mapping.created_at,

            "mitre",

            "MITRE ATT&CK technique mapped",

            (
                f"{mapping.technique_id} "
                f"{mapping.technique_name}"
                + (
                    f" ({mapping.tactic})"
                    if mapping.tactic
                    else ""
                )
                + "."
            ),

            severity="medium",

            source_id=mapping.id,

            metadata={

                "mapping_id":
                    mapping.id,

                "finding_id":
                    mapping.finding_id,

                "technique_id":
                    mapping.technique_id,

                "technique_name":
                    mapping.technique_name,

                "tactic":
                    mapping.tactic,

                "description":
                    mapping.description,

                "evidence":
                    mapping.evidence

            }

        )


    # =====================================================
    # AFFECTED USERS
    # =====================================================

    affected_users = AffectedUser.query.filter_by(
        case_id=case_id
    ).all()


    for user in affected_users:

        add_event(

            (
                user.first_seen
                or user.created_at
            ),

            "affected_user",

            "Affected user identified",

            (
                f"Affected user "
                f"{user.user_email} "
                f"was identified in the investigation."
            ),

            severity=(
                "critical"
                if user.account_compromised
                else (
                    "high"
                    if user.submitted_credentials
                    else (
                        "medium"
                        if user.clicked_link
                        else "low"
                    )
                )
            ),

            source_id=user.id,

            metadata={

                "user_id":
                    user.id,

                "user_email":
                    user.user_email,

                "display_name":
                    user.display_name,

                "department":
                    user.department,

                "received_email":
                    user.received_email,

                "clicked_link":
                    user.clicked_link,

                "submitted_credentials":
                    user.submitted_credentials,

                "account_compromised":
                    user.account_compromised,

                "impact_status":
                    user.impact_status,

                "first_seen":
                    (
                        user.first_seen.isoformat()
                        if user.first_seen
                        else None
                    ),

                "last_seen":
                    (
                        user.last_seen.isoformat()
                        if user.last_seen
                        else None
                    )

            }

        )


    # =====================================================
    # CONTAINMENT ACTIONS
    # =====================================================

    containment_actions = (
        ContainmentAction.query
        .filter_by(
            case_id=case_id
        )
        .all()
    )


    for action in containment_actions:

        add_event(

            action.created_at,

            "containment",

            "Containment action created",

            (
                f"Containment action "
                f"\"{action.action_type}\" "
                f"was created with status "
                f"{action.status}."
            ),

            severity=(
                "low"
                if action.status == "completed"
                else "medium"
            ),

            source_id=action.id,

            metadata={

                "action_id":
                    action.id,

                "action_type":
                    action.action_type,

                "target":
                    action.target,

                "status":
                    action.status,

                "affected_user_id":
                    action.affected_user_id,

                "performed_by":
                    action.performed_by,

                "performed_at":
                    (
                        action.performed_at.isoformat()
                        if action.performed_at
                        else None
                    ),

                "notes":
                    action.notes

            }

        )


        # -------------------------------------------------
        # COMPLETED CONTAINMENT EVENT
        # -------------------------------------------------

        if action.performed_at:

            add_event(

                action.performed_at,

                "containment_completed",

                "Containment action completed",

                (
                    f"Containment action "
                    f"\"{action.action_type}\" "
                    f"was completed."
                ),

                severity="low",

                source_id=action.id,

                metadata={

                    "action_id":
                        action.id,

                    "action_type":
                        action.action_type,

                    "target":
                        action.target,

                    "performed_by":
                        action.performed_by,

                    "status":
                        action.status

                }

            )


    # =====================================================
    # SORT EVENTS
    # =====================================================

    events.sort(
        key=lambda event:
            event["timestamp"]
    )


    # =====================================================
    # SUMMARY
    # =====================================================

    event_counts = {}


    for event in events:

        event_type = event[
            "event_type"
        ]

        event_counts[event_type] = (
            event_counts.get(
                event_type,
                0
            ) + 1
        )


    # =====================================================
    # RESPONSE
    # =====================================================

    return jsonify({

        "case_id":
            case_id,

        "case": {

            "id":
                case.id,

            "case_number":
                case.case_number,

            "title":
                case.title,

            "severity":
                case.severity,

            "status":
                case.status

        },

        "count":
            len(events),

        "event_counts":
            event_counts,

        "timeline":
            events

    })