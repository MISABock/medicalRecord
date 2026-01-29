import os
import uuid
from datetime import date

import boto3
from botocore.client import Config
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile
from fastapi.responses import StreamingResponse
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

S3_BUCKET = os.getenv("S3_BUCKET", "medicalrecord")


def get_s3_client():
    endpoint_url = os.getenv("S3_ENDPOINT_URL")
    access_key = os.getenv("S3_ACCESS_KEY")
    secret_key = os.getenv("S3_SECRET_KEY")
    region = os.getenv("S3_REGION", "us-east-1")

    if not endpoint_url or not access_key or not secret_key:
        raise RuntimeError("S3 Konfiguration fehlt. Bitte S3_* Env Variablen setzen.")

    return boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name=region,
        config=Config(signature_version="s3v4"),
    )


def ensure_bucket_exists(s3, bucket: str):
    try:
        s3.head_bucket(Bucket=bucket)
    except Exception:
        s3.create_bucket(Bucket=bucket)


@router.post("/files")
async def upload_file(
    upload: UploadFile = FastAPIFile(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not upload.filename:
        raise HTTPException(status_code=400, detail="Dateiname fehlt.")

    ext = os.path.splitext(upload.filename or "")[1].lower()
    storage_name = f"{uuid.uuid4()}{ext}"
    object_key = f"users/{current_user.id}/{storage_name}"

    s3 = get_s3_client()
    ensure_bucket_exists(s3, S3_BUCKET)

    try:
        upload.file.seek(0)
        s3.upload_fileobj(
            upload.file,
            S3_BUCKET,
            object_key,
            ExtraArgs={
                "ContentType": upload.content_type or "application/octet-stream",
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Upload fehlgeschlagen.") from e

    file_row = File(
        user_id=current_user.id,
        original_name=upload.filename or storage_name,
        storage_name=object_key,
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
            "medication": doc.medication,
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

    s3 = get_s3_client()
    ensure_bucket_exists(s3, S3_BUCKET)

    object_key = file_row.storage_name

    try:
        obj = s3.get_object(Bucket=S3_BUCKET, Key=object_key)
        body = obj["Body"]
    except Exception as e:
        raise HTTPException(status_code=404, detail="Datei nicht gefunden.") from e

    headers = {
        "Content-Disposition": f'inline; filename="{file_row.original_name}"'
    }

    return StreamingResponse(
        body,
        media_type=file_row.content_type or "application/octet-stream",
        headers=headers,
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
    medication = payload.get("medication")
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
        medication=medication,
        file_id=file_row.id,
    )
    
    print(doc)

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
        "medication": doc.medication,
        "file_id": str(doc.file_id) if doc.file_id else None,
        "created_at": doc.created_at.isoformat(),
        
    }


@router.post("/{doc_id}/update")
def update_document(
    doc_id: str,
    payload: dict,
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

    title = payload.get("title")
    service_date = payload.get("service_date")
    provider = payload.get("provider")
    doc_type = payload.get("doc_type")
    medication = payload.get("medication")

    if not title or not service_date or not provider or not doc_type:
        raise HTTPException(status_code=400, detail="Pflichtfelder fehlen.")

    try:
        service_date_parsed = date.fromisoformat(service_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Ungueltiges Datum.")

    doc.title = title
    doc.service_date = service_date_parsed
    doc.provider = provider
    doc.doc_type = doc_type
    doc.medication = medication

    db.commit()
    db.refresh(doc)

    return {
        "id": str(doc.id),
        "user_id": str(doc.user_id),
        "title": doc.title,
        "service_date": doc.service_date.isoformat(),
        "provider": doc.provider,
        "medication": str(doc.medication),
        "doc_type": doc.doc_type,
        "file_id": str(doc.file_id) if doc.file_id else None,
        "created_at": doc.created_at.isoformat(),
    }


@router.post("/{doc_id}/delete")
def delete_document(
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

    file_row = None
    if doc.file_id:
        file_row = (
            db.query(File)
            .filter(File.id == doc.file_id)
            .filter(File.user_id == current_user.id)
            .first()
        )

    s3 = get_s3_client()
    ensure_bucket_exists(s3, S3_BUCKET)

    if file_row:
        try:
            s3.delete_object(
                Bucket=S3_BUCKET,
                Key=file_row.storage_name,
            )
        except Exception:
            pass

        db.delete(file_row)

    db.delete(doc)
    db.commit()

    return {"status": "ok"}
