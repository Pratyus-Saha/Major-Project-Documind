from typing import Literal

from pydantic import BaseModel, Field


DocumentType = Literal["legal", "research", "unknown"]


class StructuredSection(BaseModel):
    key: str
    title: str
    points: list[str] = Field(default_factory=list)
    page_refs: list[int] = Field(default_factory=list)


class RiskFlag(BaseModel):
    title: str
    points: list[str] = Field(default_factory=list)
    severity: Literal["low", "medium", "high"] = "medium"
    page_refs: list[int] = Field(default_factory=list)


class AnalyzeResponse(BaseModel):
    document_type: DocumentType
    summary_points: list[str] = Field(default_factory=list)
    sections: list[StructuredSection] = Field(default_factory=list)
    risk_flags: list[RiskFlag] = Field(default_factory=list)
    viva_questions: list[str] = Field(default_factory=list)


class ResearchSection(BaseModel):
    points: list[str] = Field(default_factory=list)
    page_refs: list[int] = Field(default_factory=list)


class ResearchAnalyzeResponse(BaseModel):
    document_type: Literal["research"] = "research"
    title: str | None = None
    title_page_refs: list[int] = Field(default_factory=list)
    summary_points: list[str] = Field(default_factory=list)
    problem_statement: ResearchSection = Field(default_factory=ResearchSection)
    methodology: ResearchSection = Field(default_factory=ResearchSection)
    dataset_or_sample: ResearchSection = Field(default_factory=ResearchSection)
    key_findings: ResearchSection = Field(default_factory=ResearchSection)
    limitations: ResearchSection = Field(default_factory=ResearchSection)
    novelty: ResearchSection = Field(default_factory=ResearchSection)
    research_gaps: ResearchSection = Field(default_factory=ResearchSection)
    future_work: ResearchSection = Field(default_factory=ResearchSection)
    viva_questions: list[str] = Field(default_factory=list)


class ResearchComparePaper(BaseModel):
    title: str | None = None
    title_page_refs: list[int] = Field(default_factory=list)
    summary_points: list[str] = Field(default_factory=list)
    methodology: ResearchSection = Field(default_factory=ResearchSection)
    dataset_or_sample: ResearchSection = Field(default_factory=ResearchSection)
    key_findings: ResearchSection = Field(default_factory=ResearchSection)
    limitations: ResearchSection = Field(default_factory=ResearchSection)
    research_gaps: ResearchSection = Field(default_factory=ResearchSection)


class ComparisonSection(BaseModel):
    points: list[str] = Field(default_factory=list)
    paper_a_pages: list[int] = Field(default_factory=list)
    paper_b_pages: list[int] = Field(default_factory=list)


class ResearchCompareResponse(BaseModel):
    document_type: Literal["research_compare"] = "research_compare"
    paper_a: ResearchComparePaper = Field(default_factory=ResearchComparePaper)
    paper_b: ResearchComparePaper = Field(default_factory=ResearchComparePaper)
    overlap: ComparisonSection = Field(default_factory=ComparisonSection)
    methodology_differences: ComparisonSection = Field(
        default_factory=ComparisonSection
    )
    findings_differences: ComparisonSection = Field(default_factory=ComparisonSection)
    gap_comparison: ComparisonSection = Field(default_factory=ComparisonSection)
    strengths_by_paper: ComparisonSection = Field(default_factory=ComparisonSection)
    best_use_case_by_paper: ComparisonSection = Field(
        default_factory=ComparisonSection
    )
    final_synthesis: ComparisonSection = Field(default_factory=ComparisonSection)


def build_empty_response(document_type: DocumentType) -> AnalyzeResponse:
    return AnalyzeResponse(
        document_type=document_type,
        summary_points=[],
        sections=[],
        risk_flags=[],
        viva_questions=[],
    )


def build_empty_research_response() -> ResearchAnalyzeResponse:
    return ResearchAnalyzeResponse()


def build_empty_research_compare_response() -> ResearchCompareResponse:
    return ResearchCompareResponse()
