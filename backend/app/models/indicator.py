from datetime import datetime

from app import db


class Indicator(db.Model):
    __tablename__ = "indicators"

    id = db.Column(
        db.BigInteger,
        primary_key=True
    )

    email_id = db.Column(
        db.BigInteger,
        db.ForeignKey("emails.id", ondelete="CASCADE"),
        nullable=False
    )

    indicator_type = db.Column(
        db.String(30),
        nullable=False
    )

    value = db.Column(
        db.String(1000),
        nullable=False
    )

    source = db.Column(
        db.String(100)
    )

    confidence = db.Column(
        db.String(20)
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
            "email_id": self.email_id,
            "indicator_type": self.indicator_type,
            "value": self.value,
            "source": self.source,
            "confidence": self.confidence,
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