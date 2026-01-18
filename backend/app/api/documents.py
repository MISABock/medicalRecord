import os
import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import get_current_user
from app.models.document import Document
from app.models.file import File
from app.models.user import User


router = APIRouter(
    prefix="/documents",
    tags=["documents"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/files")
def upload_file(
    upload: UploadFile = FastAPIFile(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ext = os.path.splitext(upload.filename or "")[1].lower()
    storage_name = f"{uuid.uuid4()}{ext}"
    path = os.path.join(UPLOAD_DIR, storage_name)

    with open(path, "wb") as f:
        f.write(upload.file.read())

    file_row = File(
        user_id=current_user.id,
        original_name=upload.filename or storage_name,
        storage_name=storage_name,
        content_type=upload.content_type,
    )

    db.add(file_row)
    db.commit()
    db.refresh(file_row)

    return {
        "id": str(file_row.id),
        "original_name": file_row.original_name,
        "content_type": file_row.content_type,
        "created_at": file_row.created_at.isoformat(),
    }


@router.get("")
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    docs = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.service_date.desc())
        .all()
    )

    return [
        {
            "id": str(doc.id),
            "title": doc.title,
            "service_date": doc.service_date.isoformat(),
            "provider": doc.provider,
            "doc_type": doc.doc_type,
            "file_id": str(fid) if (fid := getattr(doc, "file_id", None)) else None,
            "created_at": doc.created_at.isoformat(),
        }
        for doc in docs
    ]


@router.get("/{doc_id}/file")
def get_document_file(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = (
        db.query(Document)
        .filter(Document.id == doc_id)
        .filter(Document.user_id == current_user.id)
        .first()
    )

    if not doc:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden.")

    if not doc.file_id:
        raise HTTPException(status_code=404, detail="Keine Datei vorhanden.")

    file_row = (
        db.query(File)
        .filter(File.id == doc.file_id)
        .filter(File.user_id == current_user.id)
        .first()
    )

    if not file_row:
        raise HTTPException(status_code=404, detail="Datei nicht gefunden.")

    path = os.path.join(UPLOAD_DIR, file_row.storage_name)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Datei nicht gefunden.")

    return FileResponse(
        path,
        media_type=file_row.content_type or "application/octet-stream",
        filename=file_row.original_name,
    )


@router.post("")
def create_document(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    title = payload.get("title")
    service_date = payload.get("service_date")
    provider = payload.get("provider")
    doc_type = payload.get("doc_type")
    file_id = payload.get("file_id")

    if not title or not service_date or not provider or not doc_type:
        raise HTTPException(status_code=400, detail="Pflichtfelder fehlen.")

    if not file_id:
        raise HTTPException(status_code=400, detail="Datei fehlt.")

    try:
        service_date_parsed = date.fromisoformat(service_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Ungueltiges Datum.")

    file_row = (
        db.query(File)
        .filter(File.id == file_id)
        .filter(File.user_id == current_user.id)
        .first()
    )

    if not file_row:
        raise HTTPException(status_code=400, detail="Ungueltige Datei.")

    doc = Document(
        user_id=current_user.id,
        title=title,
        service_date=service_date_parsed,
        provider=provider,
        doc_type=doc_type,
        file_id=file_row.id,
    )

    db.add(doc)
    db.commit()
    db.refresh(doc)

    return {
        "id": str(doc.id),
        "user_id": str(doc.user_id),
        "title": doc.title,
        "service_date": doc.service_date.isoformat(),
        "provider": doc.provider,
        "doc_type": doc.doc_type,
        "file_id": str(doc.file_id) if doc.file_id else None,
        "created_at": doc.created_at.isoformat(),
    }
