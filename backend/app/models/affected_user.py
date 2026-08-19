from datetime import datetime

from app import db


class AffectedUser(db.Model):
    __tablename__ = "affected_users"

    id = db.Column(
        db.BigInteger,
        primary_key=True
    )

    case_id = db.Column(
        db.BigInteger,
        db.ForeignKey("cases.id", ondelete="CASCADE"),
        nullable=False
    )

    user_email = db.Column(
        db.String(255),
        nullable=False
    )

    display_name = db.Column(
        db.String(255)
    )

    department = db.Column(
        db.String(255)
    )

    received_email = db.Column(
        db.Boolean,
        nullable=False,
        default=False
    )

    clicked_link = db.Column(
        db.Boolean,
        nullable=False,
        default=False
    )

    submitted_credentials = db.Column(
        db.Boolean,
        nullable=False,
        default=False
    )

    account_compromised = db.Column(
        db.Boolean,
        nullable=False,
        default=False
    )

    impact_status = db.Column(
        db.String(30),
        nullable=False,
        default="unknown"
    )

    first_seen = db.Column(
        db.DateTime
    )

    last_seen = db.Column(
        db.DateTime
    )

    notes = db.Column(
        db.Text
    )

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    def to_dict(self):
        return {
            "id": self.id,
            "case_id": self.case_id,
            "user_email": self.user_email,
            "display_name": self.display_name,
            "department": self.department,
            "received_email": self.received_email,
            "clicked_link": self.clicked_link,
            "submitted_credentials": self.submitted_credentials,
            "account_compromised": self.account_compromised,
            "impact_status": self.impact_status,
            "first_seen": (
                self.first_seen.isoformat()
                if self.first_seen
                else None
            ),
            "last_seen": (
                self.last_seen.isoformat()
                if self.last_seen
                else None
            ),
            "notes": self.notes,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            )
        }