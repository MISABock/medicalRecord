import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class File(Base):
    __tablename__ = "files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    original_name = Column(String, nullable=False)
    storage_name = Column(String, nullable=False)
    content_type = Column(String, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    user = relationship("User")
