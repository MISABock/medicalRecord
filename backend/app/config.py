from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_issuer: str = "medicalrecord"
    jwt_audience: str = "medicalrecord-web"
    jwt_expires_min: int = 60

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
