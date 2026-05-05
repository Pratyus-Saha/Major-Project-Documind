from pathlib import Path

import fitz

from app.utils import normalize_whitespace, validate_pdf_filename


def extract_pdf_pages(file_path: str) -> list[dict[str, int | str]]:
    pdf_path = Path(file_path)
    validate_pdf_filename(pdf_path.name)

    if not pdf_path.exists() or not pdf_path.is_file():
        raise ValueError("PDF file was not found.")

    try:
        with fitz.open(pdf_path) as document:
            if document.needs_pass:
                raise ValueError("Encrypted PDFs are not supported.")

            extracted_pages: list[dict[str, int | str]] = []

            for index, page in enumerate(document, start=1):
                cleaned_text = normalize_whitespace(page.get_text("text"))
                if not cleaned_text:
                    continue

                extracted_pages.append({"page": index, "text": cleaned_text})
    except ValueError:
        raise
    except Exception as exc:
        raise ValueError("Unable to read the PDF file.") from exc

    if not extracted_pages:
        raise ValueError("No readable text found in the PDF.")

    return extracted_pages
