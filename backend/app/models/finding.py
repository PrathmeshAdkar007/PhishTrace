from datetime import datetime

from app import db


class Finding(db.Model):
    __tablename__ = "findings"

    id = db.Column(
        db.BigInteger,
        primary_key=True
    )

    case_id = db.Column(
        db.BigInteger,
        db.ForeignKey("cases.id", ondelete="CASCADE"),
        nullable=False
    )

    finding_type = db.Column(
        db.String(50),
        nullable=False
    )

    title = db.Column(
        db.String(255),
        nullable=False
    )

    description = db.Column(
        db.Text,
        nullable=False
    )

    severity = db.Column(
        db.String(20),
        nullable=False
    )

    confidence = db.Column(
        db.String(20)
    )

    evidence = db.Column(
        db.JSON
    )

    analyst_notes = db.Column(
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
            "finding_type": self.finding_type,
            "title": self.title,
            "description": self.description,
            "severity": self.severity,
            "confidence": self.confidence,
            "evidence": self.evidence,
            "analyst_notes": self.analyst_notes,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            )
        }