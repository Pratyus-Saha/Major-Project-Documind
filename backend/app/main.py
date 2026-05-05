import logging
from pathlib import Path
from time import perf_counter

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.classifier import classify_document
from app.extractor import extract_pdf_pages
from app.llm import generate_structured_output
from app.prompts import (
    build_legal_prompt,
    build_research_compare_prompt,
    build_research_prompt,
    build_research_review_prompt,
)
from app.schemas import (
    AnalyzeResponse,
    ComparisonSection,
    ResearchAnalyzeResponse,
    ResearchComparePaper,
    ResearchCompareResponse,
    ResearchSection,
    RiskFlag,
    StructuredSection,
    build_empty_response,
)
from app.utils import cleanup_temp_file, save_temp_pdf, validate_pdf_filename


load_dotenv(Path(__file__).resolve().parents[1] / ".env")

logger = logging.getLogger("uvicorn.error")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="DocuMind Backend")
BASE_DIR = Path(__file__).resolve().parents[1]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    started = perf_counter()
    logger.info("Incoming request: %s %s", request.method, request.url.path)
    try:
        response = await call_next(request)
    except Exception:
        elapsed_ms = (perf_counter() - started) * 1000
        logger.exception(
            "Request failed: %s %s in %.1fms",
            request.method,
            request.url.path,
            elapsed_ms,
        )
        raise

    elapsed_ms = (perf_counter() - started) * 1000
    logger.info(
        "Completed request: %s %s -> %s in %.1fms",
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms,
    )
    return response


LEGAL_SECTIONS = [
    ("payment_terms", "Payment Terms"),
    ("termination", "Termination"),
    ("liability", "Liability"),
    ("confidentiality", "Confidentiality"),
]

RESEARCH_SECTIONS = [
    ("problem_statement", "Problem Statement"),
    ("methodology", "Methodology"),
    ("results", "Results"),
    ("limitations", "Limitations"),
]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def _normalize_text(value: object) -> str | None:
    if not isinstance(value, str):
        return None

    cleaned = " ".join(value.strip().split())
    return cleaned or None


def _normalize_page(value: object) -> int | None:
    if isinstance(value, int) and value > 0:
        return value

    if isinstance(value, str) and value.isdigit():
        page = int(value)
        return page if page > 0 else None

    return None


def _normalize_page_list(payload: object, max_pages: int = 6) -> list[int]:
    if not isinstance(payload, list):
        return []

    pages: list[int] = []
    for item in payload:
        page = _normalize_page(item)
        if page is not None and page not in pages:
            pages.append(page)

    return pages[:max_pages]


def _normalize_points(payload: object, max_points: int = 5) -> list[str]:
    if not isinstance(payload, list):
        return []

    points: list[str] = []
    seen: set[str] = set()
    for item in payload:
        text = _normalize_text(item)
        if not text:
            continue

        key = text.casefold()
        if key in seen:
            continue

        seen.add(key)
        points.append(text)
        if len(points) >= max_points:
            break

    return points


def _normalize_section(payload: object, key: str, title: str) -> StructuredSection:
    if not isinstance(payload, dict):
        return StructuredSection(key=key, title=title)

    return StructuredSection(
        key=key,
        title=title,
        points=_normalize_points(payload.get("points")),
        page_refs=_normalize_page_list(payload.get("page_refs")),
    )


def _normalize_research_section(payload: object) -> ResearchSection:
    if not isinstance(payload, dict):
        return ResearchSection()

    return ResearchSection(
        points=_normalize_points(payload.get("points")),
        page_refs=_normalize_page_list(payload.get("page_refs")),
    )


def _normalize_risk_flags(payload: object) -> list[RiskFlag]:
    if not isinstance(payload, list):
        return []

    risk_flags: list[RiskFlag] = []
    for item in payload:
        if not isinstance(item, dict):
            continue

        title = _normalize_text(item.get("title"))
        points = _normalize_points(item.get("points"))
        severity = _normalize_text(item.get("severity")) or "medium"
        if severity not in {"low", "medium", "high"}:
            severity = "medium"

        if not title and not points:
            continue

        risk_flags.append(
            RiskFlag(
                title=title or "Risk Flag",
                points=points,
                severity=severity,
                page_refs=_normalize_page_list(item.get("page_refs")),
            )
        )

    return risk_flags[:6]


def _normalize_comparison_section(payload: object) -> ComparisonSection:
    if not isinstance(payload, dict):
        return ComparisonSection()

    return ComparisonSection(
        points=_normalize_points(payload.get("points")),
        paper_a_pages=_normalize_page_list(payload.get("paper_a_pages")),
        paper_b_pages=_normalize_page_list(payload.get("paper_b_pages")),
    )


def _normalize_compare_paper(payload: object) -> ResearchComparePaper:
    if not isinstance(payload, dict):
        return ResearchComparePaper()

    return ResearchComparePaper(
        title=_normalize_text(payload.get("title")),
        title_page_refs=_normalize_page_list(payload.get("title_page_refs")),
        summary_points=_normalize_points(payload.get("summary_points")),
        methodology=_normalize_research_section(payload.get("methodology")),
        dataset_or_sample=_normalize_research_section(
            payload.get("dataset_or_sample")
        ),
        key_findings=_normalize_research_section(payload.get("key_findings")),
        limitations=_normalize_research_section(payload.get("limitations")),
        research_gaps=_normalize_research_section(payload.get("research_gaps")),
    )


def _normalize_viva_questions(payload: object) -> list[str]:
    return _normalize_points(payload, max_points=5)


def _normalize_legal_response(payload: dict) -> AnalyzeResponse:
    sections = [
        _normalize_section(payload_section, key, title)
        for key, title in LEGAL_SECTIONS
        for payload_section in [
            next(
                (
                    item
                    for item in payload.get("sections", [])
                    if isinstance(item, dict) and item.get("key") == key
                ),
                None,
            )
        ]
    ]

    return AnalyzeResponse(
        document_type="legal",
        summary_points=_normalize_points(payload.get("summary_points")),
        sections=sections,
        risk_flags=_normalize_risk_flags(payload.get("risk_flags")),
        viva_questions=[],
    )


def _normalize_research_response(payload: dict) -> AnalyzeResponse:
    sections = [
        _normalize_section(payload_section, key, title)
        for key, title in RESEARCH_SECTIONS
        for payload_section in [
            next(
                (
                    item
                    for item in payload.get("sections", [])
                    if isinstance(item, dict) and item.get("key") == key
                ),
                None,
            )
        ]
    ]

    return AnalyzeResponse(
        document_type="research",
        summary_points=_normalize_points(payload.get("summary_points")),
        sections=sections,
        risk_flags=[],
        viva_questions=_normalize_viva_questions(payload.get("viva_questions")),
    )


def _normalize_research_review_response(payload: dict) -> ResearchAnalyzeResponse:
    return ResearchAnalyzeResponse(
        document_type="research",
        title=_normalize_text(payload.get("title")),
        title_page_refs=_normalize_page_list(payload.get("title_page_refs")),
        summary_points=_normalize_points(payload.get("summary_points")),
        problem_statement=_normalize_research_section(
            payload.get("problem_statement")
        ),
        methodology=_normalize_research_section(payload.get("methodology")),
        dataset_or_sample=_normalize_research_section(
            payload.get("dataset_or_sample")
        ),
        key_findings=_normalize_research_section(payload.get("key_findings")),
        limitations=_normalize_research_section(payload.get("limitations")),
        novelty=_normalize_research_section(payload.get("novelty")),
        research_gaps=_normalize_research_section(payload.get("research_gaps")),
        future_work=_normalize_research_section(payload.get("future_work")),
        viva_questions=_normalize_viva_questions(payload.get("viva_questions")),
    )


def _normalize_research_compare_response(payload: dict) -> ResearchCompareResponse:
    return ResearchCompareResponse(
        document_type="research_compare",
        paper_a=_normalize_compare_paper(payload.get("paper_a")),
        paper_b=_normalize_compare_paper(payload.get("paper_b")),
        overlap=_normalize_comparison_section(payload.get("overlap")),
        methodology_differences=_normalize_comparison_section(
            payload.get("methodology_differences")
        ),
        findings_differences=_normalize_comparison_section(
            payload.get("findings_differences")
        ),
        gap_comparison=_normalize_comparison_section(payload.get("gap_comparison")),
        strengths_by_paper=_normalize_comparison_section(
            payload.get("strengths_by_paper")
        ),
        best_use_case_by_paper=_normalize_comparison_section(
            payload.get("best_use_case_by_paper")
        ),
        final_synthesis=_normalize_comparison_section(
            payload.get("final_synthesis")
        ),
    )


def _validate_upload(file: UploadFile) -> None:
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    if file.content_type and file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    validate_pdf_filename(file.filename)


def _get_backend_error_detail(exc: Exception) -> str:
    message = str(exc).lower()
    if "quota" in message or "resourceexhausted" in message or "429" in message:
        return "Gemini quota was exceeded. Please try again in a minute or use a project with available quota."
    if "api key" in message:
        return "Gemini API configuration is missing or invalid."
    if "model" in message and "not found" in message:
        return "The configured Gemini model is unavailable for this project. Check GEMINI_MODEL and try again."
    return "Failed to analyze the PDF."


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(file: UploadFile = File(...)) -> AnalyzeResponse:
    logger.info(f"Received /analyze request for file: {file.filename}")
    temp_path = None

    try:
        _validate_upload(file)
        file_bytes = await file.read()
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Uploaded PDF is empty.")

        temp_path = save_temp_pdf(
            filename=file.filename,
            file_bytes=file_bytes,
            base_dir=BASE_DIR,
        )

        pages = extract_pdf_pages(str(temp_path))
        document_type = classify_document(pages)

        if document_type == "unknown":
            return build_empty_response(document_type="unknown")

        if document_type == "legal":
            prompt = build_legal_prompt(pages)
            raw_output = generate_structured_output(prompt=prompt, mode="legal")
            return _normalize_legal_response(raw_output)

        prompt = build_research_prompt(pages)
        raw_output = generate_structured_output(prompt=prompt, mode="research")
        return _normalize_research_response(raw_output)
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unexpected error while analyzing PDF")
        raise HTTPException(
            status_code=502,
            detail=_get_backend_error_detail(exc),
        ) from exc
    finally:
        if temp_path is not None:
            cleanup_temp_file(temp_path)


@app.post("/research/analyze", response_model=ResearchAnalyzeResponse)
async def analyze_research(file: UploadFile = File(...)) -> ResearchAnalyzeResponse:
    logger.info(f"Received /research/analyze request for file: {file.filename}")
    temp_path = None

    try:
        _validate_upload(file)
        file_bytes = await file.read()
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Uploaded PDF is empty.")

        temp_path = save_temp_pdf(
            filename=file.filename,
            file_bytes=file_bytes,
            base_dir=BASE_DIR,
        )

        pages = extract_pdf_pages(str(temp_path))
        prompt = build_research_review_prompt(pages)
        raw_output = generate_structured_output(
            prompt=prompt,
            mode="research_review",
        )
        return _normalize_research_review_response(raw_output)
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unexpected error while analyzing research PDF")
        raise HTTPException(
            status_code=502,
            detail=_get_backend_error_detail(exc),
        ) from exc
    finally:
        if temp_path is not None:
            cleanup_temp_file(temp_path)


@app.post("/research/compare", response_model=ResearchCompareResponse)
async def compare_research(
    files: list[UploadFile] = File(...),
) -> ResearchCompareResponse:
    logger.info(f"Received /research/compare request with {len(files)} files.")
    temp_paths: list[Path] = []

    try:
        if len(files) != 2:
            raise HTTPException(
                status_code=400,
                detail="Research comparison requires exactly 2 PDF files.",
            )

        paper_pages: list[list[dict[str, int | str]]] = []

        for file in files:
            _validate_upload(file)
            file_bytes = await file.read()
            if not file_bytes:
                raise HTTPException(status_code=400, detail="One uploaded PDF is empty.")

            temp_path = save_temp_pdf(
                filename=file.filename,
                file_bytes=file_bytes,
                base_dir=BASE_DIR,
            )
            temp_paths.append(temp_path)
            paper_pages.append(extract_pdf_pages(str(temp_path)))

        prompt = build_research_compare_prompt(paper_pages[0], paper_pages[1])
        raw_output = generate_structured_output(
            prompt=prompt,
            mode="research_compare",
        )
        return _normalize_research_compare_response(raw_output)
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unexpected error while comparing research PDFs")
        raise HTTPException(
            status_code=502,
            detail=_get_backend_error_detail(exc),
        ) from exc
    finally:
        for temp_path in temp_paths:
            cleanup_temp_file(temp_path)
