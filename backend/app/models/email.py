from datetime import datetime

from app import db


class Email(db.Model):
    __tablename__ = "emails"

    id = db.Column(db.BigInteger, primary_key=True)

    case_id = db.Column(
        db.BigInteger,
        db.ForeignKey("cases.id", ondelete="CASCADE"),
        nullable=False
    )

    message_id = db.Column(db.String(500))
    sender = db.Column(db.String(255), nullable=False)
    recipient = db.Column(db.String(255))
    subject = db.Column(db.String(500))
    return_path = db.Column(db.String(255))
    reply_to = db.Column(db.String(255))
    received_at = db.Column(db.DateTime)
    raw_email = db.Column(db.Text)

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    def to_dict(self):
        return {
            "id": self.id,
            "case_id": self.case_id,
            "message_id": self.message_id,
            "sender": self.sender,
            "recipient": self.recipient,
            "subject": self.subject,
            "return_path": self.return_path,
            "reply_to": self.reply_to,
            "received_at": (
                self.received_at.isoformat()
                if self.received_at
                else None
            ),
            "raw_email": self.raw_email,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            )
        }