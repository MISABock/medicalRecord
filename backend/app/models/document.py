import uuid
from datetime import datetime, date

from sqlalchemy import Column, String, Date, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # belongs to a user (no FK yet, minimal MVP)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    file_id = Column(UUID(as_uuid=True), ForeignKey("files.id"), nullable=True)
    file = relationship("File")

    # Drei-Fragen-Regel
    title = Column(String, nullable=False)
    service_date = Column(Date, nullable=False, index=True)   # Wann?
    provider = Column(String, nullable=False, index=True)     # Wer/Wo?
    doc_type = Column(String, nullable=False, index=True)     # Was?
    medication = Column(String, nullable=False, index=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
