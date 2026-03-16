from pydantic import BaseSettings


class Settings(BaseSettings):

    PROJECT_NAME: str = "The Academic Spot"

    DATABASE_URL: str = "sqlite:///./academic_spot.db"

    GROQ_API_KEY: str | None = None


settings = Settings()