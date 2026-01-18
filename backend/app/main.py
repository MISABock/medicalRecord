from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.database import Base, engine
from app.models.user import User  # wichtig
from app.models.document import Document  # noqa: F401
from app.api.documents import router as documents_router


app = FastAPI(title="MedicalRecord API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(documents_router)


@app.get("/health")
def health():
    return {"status": "ok"}
