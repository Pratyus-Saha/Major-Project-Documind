from collections.abc import Sequence

from app.schemas import DocumentType


LEGAL_KEYWORDS = (
    "agreement",
    "indemnity",
    "liability",
    "termination",
    "confidentiality",
    "governing law",
    "party",
    "payment",
)

RESEARCH_KEYWORDS = (
    "abstract",
    "introduction",
    "methodology",
    "results",
    "conclusion",
    "references",
    "dataset",
    "experiment",
)

MINIMUM_CONFIDENT_SCORE = 2


def get_classification_scores(
    pages: Sequence[dict[str, int | str]],
    sample_page_count: int = 3,
) -> dict[str, int]:
    sample_text = " ".join(
        str(page.get("text", ""))
        for page in pages[:sample_page_count]
        if page.get("text")
    ).lower()

    return {
        "legal": sum(sample_text.count(keyword) for keyword in LEGAL_KEYWORDS),
        "research": sum(
            sample_text.count(keyword) for keyword in RESEARCH_KEYWORDS
        ),
    }


def classify_document(
    pages: Sequence[dict[str, int | str]],
    sample_page_count: int = 3,
) -> DocumentType:
    if not pages:
        return "unknown"

    scores = get_classification_scores(
        pages=pages,
        sample_page_count=sample_page_count,
    )

    legal_score = scores["legal"]
    research_score = scores["research"]
    best_score = max(legal_score, research_score)

    if best_score < MINIMUM_CONFIDENT_SCORE or legal_score == research_score:
        return "unknown"

    if legal_score > research_score:
        return "legal"

    return "research"
