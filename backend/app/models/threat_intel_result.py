from datetime import datetime

from app import db


class ThreatIntelResult(db.Model):
    __tablename__ = "threat_intel_results"

    id = db.Column(
        db.BigInteger,
        primary_key=True
    )

    indicator_id = db.Column(
        db.BigInteger,
        db.ForeignKey("indicators.id", ondelete="CASCADE"),
        nullable=False
    )

    provider = db.Column(
        db.String(50),
        nullable=False
    )

    verdict = db.Column(
        db.String(30)
    )

    score = db.Column(
        db.Numeric(5, 2)
    )

    confidence = db.Column(
        db.String(20)
    )

    raw_response = db.Column(
        db.JSON
    )

    checked_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    notes = db.Column(
        db.Text
    )

    def to_dict(self):
        return {
            "id": self.id,
            "indicator_id": self.indicator_id,
            "provider": self.provider,
            "verdict": self.verdict,
            "score": (
                float(self.score)
                if self.score is not None
                else None
            ),
            "confidence": self.confidence,
            "raw_response": self.raw_response,
            "checked_at": (
                self.checked_at.isoformat()
                if self.checked_at
                else None
            ),
            "notes": self.notes
        }