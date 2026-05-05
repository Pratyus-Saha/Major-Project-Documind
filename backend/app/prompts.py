from collections.abc import Sequence


def _format_pages(pages: Sequence[dict[str, int | str]]) -> str:
    return "\n\n".join(f"Page {page['page']}:\n{page['text']}" for page in pages)


def _shared_rules() -> str:
    return """Use only the document text provided below.
Do not invent facts.
Return points, not paragraphs.
Each point must contain only one idea.
Prefer specific facts over vague wording.
If a field is missing, return an empty array or null as instructed.
Return valid JSON only.
Do not return markdown.
Do not include any explanation outside the JSON."""


def build_legal_prompt(pages: Sequence[dict[str, int | str]]) -> str:
    page_text = _format_pages(pages)

    return f"""You are analyzing a legal document.

{_shared_rules()}

Return 3-5 short summary points.
For each section and risk flag, return 2-5 short factual bullet points.
Use page_refs arrays. If only one page is relevant, still return it inside an array.
Choose a severity of low, medium, or high for each risk flag.

Output JSON shape:
{{
  "summary_points": ["point 1", "point 2"],
  "sections": [
    {{
      "key": "payment_terms",
      "title": "Payment Terms",
      "points": ["point 1", "point 2"],
      "page_refs": [1, 2]
    }},
    {{
      "key": "termination",
      "title": "Termination",
      "points": ["point 1", "point 2"],
      "page_refs": [3]
    }},
    {{
      "key": "liability",
      "title": "Liability",
      "points": ["point 1", "point 2"],
      "page_refs": [4]
    }},
    {{
      "key": "confidentiality",
      "title": "Confidentiality",
      "points": ["point 1", "point 2"],
      "page_refs": [5]
    }}
  ],
  "risk_flags": [
    {{
      "title": "Short risk title",
      "points": ["point 1", "point 2"],
      "severity": "medium",
      "page_refs": [2, 3]
    }}
  ]
}}

Document text:
{page_text}
"""


def build_research_prompt(pages: Sequence[dict[str, int | str]]) -> str:
    page_text = _format_pages(pages)

    return f"""You are analyzing a research paper.

{_shared_rules()}

Return 3-5 short summary points.
Return exactly 5 viva questions.
For each section, return 2-5 short factual bullet points with page_refs arrays.

Output JSON shape:
{{
  "summary_points": ["point 1", "point 2"],
  "sections": [
    {{
      "key": "problem_statement",
      "title": "Problem Statement",
      "points": ["point 1", "point 2"],
      "page_refs": [1]
    }},
    {{
      "key": "methodology",
      "title": "Methodology",
      "points": ["point 1", "point 2"],
      "page_refs": [2]
    }},
    {{
      "key": "results",
      "title": "Results",
      "points": ["point 1", "point 2"],
      "page_refs": [4]
    }},
    {{
      "key": "limitations",
      "title": "Limitations",
      "points": ["point 1", "point 2"],
      "page_refs": [5]
    }}
  ],
  "viva_questions": [
    "question 1",
    "question 2",
    "question 3",
    "question 4",
    "question 5"
  ]
}}

Document text:
{page_text}
"""


def build_research_review_prompt(pages: Sequence[dict[str, int | str]]) -> str:
    page_text = _format_pages(pages)

    return f"""You are analyzing one research paper for an academic review.

{_shared_rules()}

Return 3-5 short summary points.
Return exactly 5 viva questions.
For each structured section, return 2-5 short factual bullet points with page_refs arrays.
Make research gaps and future work explicit and point-by-point.
Return the paper title as a short string if it can be identified confidently, otherwise null.

Output JSON shape:
{{
  "title": "string or null",
  "title_page_refs": [1],
  "summary_points": ["point 1", "point 2"],
  "problem_statement": {{"points": ["point 1", "point 2"], "page_refs": [1]}},
  "methodology": {{"points": ["point 1", "point 2"], "page_refs": [2]}},
  "dataset_or_sample": {{"points": ["point 1", "point 2"], "page_refs": [3]}},
  "key_findings": {{"points": ["point 1", "point 2"], "page_refs": [4]}},
  "limitations": {{"points": ["point 1", "point 2"], "page_refs": [5]}},
  "novelty": {{"points": ["point 1", "point 2"], "page_refs": [2, 4]}},
  "research_gaps": {{"points": ["point 1", "point 2"], "page_refs": [5, 6]}},
  "future_work": {{"points": ["point 1", "point 2"], "page_refs": [6]}},
  "viva_questions": [
    "question 1",
    "question 2",
    "question 3",
    "question 4",
    "question 5"
  ]
}}

Document text:
{page_text}
"""


def build_research_compare_prompt(
    paper_a_pages: Sequence[dict[str, int | str]],
    paper_b_pages: Sequence[dict[str, int | str]],
) -> str:
    paper_a_text = _format_pages(paper_a_pages)
    paper_b_text = _format_pages(paper_b_pages)

    return f"""You are comparing exactly two research papers.

{_shared_rules()}

Return 3-5 short summary points for each paper.
For each paper section, return 2-5 short factual bullet points with page_refs arrays.
For each shared comparison section, return 2-5 short comparison points.
Use paper_a_pages and paper_b_pages arrays to support each shared comparison section.

Output JSON shape:
{{
  "paper_a": {{
    "title": "string or null",
    "title_page_refs": [1],
    "summary_points": ["point 1", "point 2"],
    "methodology": {{"points": ["point 1", "point 2"], "page_refs": [2]}},
    "dataset_or_sample": {{"points": ["point 1", "point 2"], "page_refs": [3]}},
    "key_findings": {{"points": ["point 1", "point 2"], "page_refs": [4]}},
    "limitations": {{"points": ["point 1", "point 2"], "page_refs": [5]}},
    "research_gaps": {{"points": ["point 1", "point 2"], "page_refs": [6]}}
  }},
  "paper_b": {{
    "title": "string or null",
    "title_page_refs": [1],
    "summary_points": ["point 1", "point 2"],
    "methodology": {{"points": ["point 1", "point 2"], "page_refs": [2]}},
    "dataset_or_sample": {{"points": ["point 1", "point 2"], "page_refs": [3]}},
    "key_findings": {{"points": ["point 1", "point 2"], "page_refs": [4]}},
    "limitations": {{"points": ["point 1", "point 2"], "page_refs": [5]}},
    "research_gaps": {{"points": ["point 1", "point 2"], "page_refs": [6]}}
  }},
  "overlap": {{"points": ["point 1", "point 2"], "paper_a_pages": [2], "paper_b_pages": [2]}},
  "methodology_differences": {{"points": ["point 1", "point 2"], "paper_a_pages": [2], "paper_b_pages": [2]}},
  "findings_differences": {{"points": ["point 1", "point 2"], "paper_a_pages": [4], "paper_b_pages": [4]}},
  "gap_comparison": {{"points": ["point 1", "point 2"], "paper_a_pages": [6], "paper_b_pages": [6]}},
  "strengths_by_paper": {{"points": ["point 1", "point 2"], "paper_a_pages": [3], "paper_b_pages": [3]}},
  "best_use_case_by_paper": {{"points": ["point 1", "point 2"], "paper_a_pages": [4], "paper_b_pages": [4]}},
  "final_synthesis": {{"points": ["point 1", "point 2"], "paper_a_pages": [2, 4], "paper_b_pages": [2, 4]}}
}}

Paper A text:
{paper_a_text}

Paper B text:
{paper_b_text}
"""
