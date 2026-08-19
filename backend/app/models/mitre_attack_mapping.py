from datetime import datetime

from app import db


class MitreAttackMapping(db.Model):
    __tablename__ = "mitre_attack_mappings"

    id = db.Column(
        db.BigInteger,
        primary_key=True
    )

    finding_id = db.Column(
        db.BigInteger,
        db.ForeignKey("findings.id", ondelete="CASCADE"),
        nullable=False
    )

    technique_id = db.Column(
        db.String(30),
        nullable=False
    )

    technique_name = db.Column(
        db.String(255),
        nullable=False
    )

    tactic = db.Column(
        db.String(100)
    )

    description = db.Column(
        db.Text
    )

    evidence = db.Column(
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
            "finding_id": self.finding_id,
            "technique_id": self.technique_id,
            "technique_name": self.technique_name,
            "tactic": self.tactic,
            "description": self.description,
            "evidence": self.evidence,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            )
        }