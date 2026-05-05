from pathlib import Path
from uuid import uuid4


TEMP_DIR_NAME = "tmp"


def normalize_whitespace(text: str) -> str:
    return " ".join(text.split())


def validate_pdf_filename(filename: str) -> None:
    if not filename or not filename.lower().endswith(".pdf"):
        raise ValueError("Only PDF files are supported.")


def ensure_temp_dir(base_dir: str | Path | None = None) -> Path:
    root_dir = Path(base_dir) if base_dir is not None else Path.cwd()
    temp_dir = root_dir / TEMP_DIR_NAME
    temp_dir.mkdir(parents=True, exist_ok=True)
    return temp_dir


def save_temp_pdf(
    filename: str,
    file_bytes: bytes,
    base_dir: str | Path | None = None,
) -> Path:
    validate_pdf_filename(filename)
    temp_dir = ensure_temp_dir(base_dir)
    temp_path = temp_dir / f"{uuid4().hex}.pdf"
    temp_path.write_bytes(file_bytes)
    return temp_path


def cleanup_temp_file(file_path: str | Path) -> None:
    path = Path(file_path)
    if path.exists():
        path.unlink()
