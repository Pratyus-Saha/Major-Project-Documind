import json
import os
import re
from typing import Literal

import google.generativeai as genai


PromptMode = Literal["legal", "research", "research_review", "research_compare"]

DEFAULT_MODEL_NAME = "gemini-2.5-flash"
JSON_REMINDER = "\n\nReturn valid JSON only. Do not include markdown."


def _strip_markdown_code_fences(text: str) -> str:
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def _parse_json_response(text: str) -> dict:
    cleaned = _strip_markdown_code_fences(text)
    return json.loads(cleaned)


def _get_fallback_output(mode: PromptMode) -> dict:
    if mode == "legal":
        return {
            "summary_points": ["Unable to parse model output"],
            "sections": [],
            "risk_flags": [],
        }

    if mode == "research":
        return {
            "summary_points": ["Unable to parse model output"],
            "sections": [],
            "viva_questions": [],
        }

    if mode == "research_review":
        return {
            "title": None,
            "title_page_refs": [],
            "summary_points": ["Unable to parse model output"],
            "problem_statement": {"points": [], "page_refs": []},
            "methodology": {"points": [], "page_refs": []},
            "dataset_or_sample": {"points": [], "page_refs": []},
            "key_findings": {"points": [], "page_refs": []},
            "limitations": {"points": [], "page_refs": []},
            "novelty": {"points": [], "page_refs": []},
            "research_gaps": {"points": [], "page_refs": []},
            "future_work": {"points": [], "page_refs": []},
            "viva_questions": [],
        }

    return {
        "paper_a": {
            "title": None,
            "title_page_refs": [],
            "summary_points": ["Unable to parse model output"],
            "methodology": {"points": [], "page_refs": []},
            "dataset_or_sample": {"points": [], "page_refs": []},
            "key_findings": {"points": [], "page_refs": []},
            "limitations": {"points": [], "page_refs": []},
            "research_gaps": {"points": [], "page_refs": []},
        },
        "paper_b": {
            "title": None,
            "title_page_refs": [],
            "summary_points": ["Unable to parse model output"],
            "methodology": {"points": [], "page_refs": []},
            "dataset_or_sample": {"points": [], "page_refs": []},
            "key_findings": {"points": [], "page_refs": []},
            "limitations": {"points": [], "page_refs": []},
            "research_gaps": {"points": [], "page_refs": []},
        },
        "overlap": {"points": [], "paper_a_pages": [], "paper_b_pages": []},
        "methodology_differences": {
            "points": [],
            "paper_a_pages": [],
            "paper_b_pages": [],
        },
        "findings_differences": {
            "points": [],
            "paper_a_pages": [],
            "paper_b_pages": [],
        },
        "gap_comparison": {"points": [], "paper_a_pages": [], "paper_b_pages": []},
        "strengths_by_paper": {
            "points": [],
            "paper_a_pages": [],
            "paper_b_pages": [],
        },
        "best_use_case_by_paper": {
            "points": [],
            "paper_a_pages": [],
            "paper_b_pages": [],
        },
        "final_synthesis": {
            "points": [],
            "paper_a_pages": [],
            "paper_b_pages": [],
        },
    }


def generate_structured_output(prompt: str, mode: PromptMode) -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set.")

    model_name = os.getenv("GEMINI_MODEL", DEFAULT_MODEL_NAME)

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name)

    first_response = (model.generate_content(prompt).text or "").strip()

    try:
        return _parse_json_response(first_response)
    except json.JSONDecodeError:
        retry_prompt = f"{prompt}{JSON_REMINDER}"
        second_response = (model.generate_content(retry_prompt).text or "").strip()
        try:
            return _parse_json_response(second_response)
        except json.JSONDecodeError:
            return _get_fallback_output(mode)
