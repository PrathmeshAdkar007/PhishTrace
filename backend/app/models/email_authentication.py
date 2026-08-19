from datetime import datetime

from app import db


class EmailAuthentication(db.Model):
    __tablename__ = "email_authentication"

    id = db.Column(db.BigInteger, primary_key=True)

    email_id = db.Column(
        db.BigInteger,
        db.ForeignKey("emails.id", ondelete="CASCADE"),
        nullable=False
    )

    spf_result = db.Column(db.String(20))
    dkim_result = db.Column(db.String(20))
    dmarc_result = db.Column(db.String(20))
    dmarc_alignment = db.Column(db.String(20))

    from_domain = db.Column(db.String(255))
    return_path_domain = db.Column(db.String(255))
    dkim_domain = db.Column(db.String(255))

    authentication_verdict = db.Column(db.String(30))

    analysis_notes = db.Column(db.Text)

    checked_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    def to_dict(self):
        return {
            "id": self.id,
            "email_id": self.email_id,
            "spf_result": self.spf_result,
            "dkim_result": self.dkim_result,
            "dmarc_result": self.dmarc_result,
            "dmarc_alignment": self.dmarc_alignment,
            "from_domain": self.from_domain,
            "return_path_domain": self.return_path_domain,
            "dkim_domain": self.dkim_domain,
            "authentication_verdict": self.authentication_verdict,
            "analysis_notes": self.analysis_notes,
            "checked_at": (
                self.checked_at.isoformat()
                if self.checked_at
                else None
            )
        }