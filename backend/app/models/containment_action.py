from datetime import datetime

from app import db


class ContainmentAction(db.Model):
    __tablename__ = "containment_actions"

    id = db.Column(
        db.BigInteger,
        primary_key=True
    )

    case_id = db.Column(
        db.BigInteger,
        db.ForeignKey("cases.id", ondelete="CASCADE"),
        nullable=False
    )

    affected_user_id = db.Column(
        db.BigInteger,
        db.ForeignKey("affected_users.id", ondelete="SET NULL")
    )

    action_type = db.Column(
        db.String(50),
        nullable=False
    )

    target = db.Column(
        db.String(1000)
    )

    status = db.Column(
        db.String(30),
        nullable=False,
        default="pending"
    )

    performed_by = db.Column(
        db.String(255)
    )

    performed_at = db.Column(
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
            "affected_user_id": self.affected_user_id,
            "action_type": self.action_type,
            "target": self.target,
            "status": self.status,
            "performed_by": self.performed_by,
            "performed_at": (
                self.performed_at.isoformat()
                if self.performed_at
                else None
            ),
            "notes": self.notes,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            )
        }