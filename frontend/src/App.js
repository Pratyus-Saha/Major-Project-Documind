import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AnalysisPanel from "./components/AnalysisPanel";
import LandingPage from "./components/LandingPage";
import PdfViewer from "./components/PdfViewer";
import UploadBox from "./components/UploadBox";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "";

function getErrorMessage(error) {
  const detail = error?.response?.data?.detail || error?.message || "";
  const message = detail.toLowerCase();

  if (message.includes("quota")) {
    return "Gemini is temporarily out of quota for this project. Wait a minute and try again.";
  }

  if (message.includes("api configuration") || message.includes("api key")) {
    return "Gemini is not configured correctly right now. Check the API key and model before trying again.";
  }

  if (message.includes("text") && message.includes("pdf")) {
    return "This PDF does not appear to contain enough selectable text for DocuMind to analyze reliably.";
  }

  return (
    detail ||
    "Unable to analyze this PDF right now. Please try another text-based English PDF."
  );
}

function getWorkspaceCopy(currentMode, researchSubmode) {
  if (currentMode === "research" && researchSubmode === "compare") {
    return {
      eyebrow: "Research Compare",
      title: "Research comparison workspace",
      description:
        "Compare exactly two research papers with page-linked methodology, findings, and gap analysis.",
      uploadTitle: "Compare two research papers",
      uploadDescription:
        "Choose exactly two text-based English research PDFs to generate a side-by-side comparison board.",
      actionLabel: "Compare Papers",
      loadingLabel: "Building Comparison...",
    };
  }

  if (currentMode === "research") {
    return {
      eyebrow: "Research Review",
      title: "Research review workspace",
      description:
        "Review one research paper through methodology, findings, novelty, limitations, and gap-focused cards.",
      uploadTitle: "Analyze one research paper",
      uploadDescription:
        "Choose a text-based English research paper to generate a deeper academic review board.",
      actionLabel: "Analyze Research Paper",
      loadingLabel: "Building Review...",
    };
  }

  return {
    eyebrow: "Legal Review",
    title: "Legal review workspace",
    description:
      "Review agreements with structured clauses, risk flags, and page-linked evidence.",
    uploadTitle: "Analyze a legal document",
    uploadDescription:
      "Choose a text-based English PDF to generate a readable legal review.",
    actionLabel: "Analyze PDF",
    loadingLabel: "Building Analysis...",
  };
}

function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildMarkdownExport(result) {
  if (!result) {
    return "# DocuMind Analysis\n\nNo analysis available.";
  }

  const lines = ["# DocuMind Analysis", "", `Mode: ${result.document_type}`, ""];

  if (result.title) {
    lines.push(`Title: ${result.title}`, "");
  }

  if (Array.isArray(result.summary_points) && result.summary_points.length) {
    lines.push("## Summary");
    result.summary_points.forEach((point) => lines.push(`- ${point}`));
    lines.push("");
  }

  if (Array.isArray(result.sections) && result.sections.length) {
    lines.push("## Sections");
    result.sections.forEach((section) => {
      lines.push(`### ${section.title}`);
      (section.points || []).forEach((point) => lines.push(`- ${point}`));
      if (section.page_refs?.length) {
        lines.push(`Pages: ${section.page_refs.join(", ")}`);
      }
      lines.push("");
    });
  }

  if (result.problem_statement) {
    [
      ["Problem Statement", result.problem_statement],
      ["Methodology", result.methodology],
      ["Dataset or Sample", result.dataset_or_sample],
      ["Key Findings", result.key_findings],
      ["Limitations", result.limitations],
      ["Novelty", result.novelty],
      ["Research Gaps", result.research_gaps],
      ["Future Work", result.future_work],
    ].forEach(([title, section]) => {
      lines.push(`## ${title}`);
      (section?.points || []).forEach((point) => lines.push(`- ${point}`));
      if (section?.page_refs?.length) {
        lines.push(`Pages: ${section.page_refs.join(", ")}`);
      }
      lines.push("");
    });
  }

  if (result.document_type === "research_compare") {
    ["paper_a", "paper_b"].forEach((paperKey) => {
      const paper = result[paperKey];
      lines.push(`## ${paperKey === "paper_a" ? "Paper A" : "Paper B"}`);
      if (paper?.title) {
        lines.push(`Title: ${paper.title}`);
      }
      (paper?.summary_points || []).forEach((point) => lines.push(`- ${point}`));
      lines.push("");
    });

    [
      ["Overlap", result.overlap],
      ["Methodology Differences", result.methodology_differences],
      ["Findings Differences", result.findings_differences],
      ["Gap Comparison", result.gap_comparison],
      ["Strengths By Paper", result.strengths_by_paper],
      ["Best Use Case By Paper", result.best_use_case_by_paper],
      ["Final Synthesis", result.final_synthesis],
    ].forEach(([title, section]) => {
      lines.push(`## ${title}`);
      (section?.points || []).forEach((point) => lines.push(`- ${point}`));
      if (section?.paper_a_pages?.length) {
        lines.push(`Paper A pages: ${section.paper_a_pages.join(", ")}`);
      }
      if (section?.paper_b_pages?.length) {
        lines.push(`Paper B pages: ${section.paper_b_pages.join(", ")}`);
      }
      lines.push("");
    });
  }

  if (Array.isArray(result.risk_flags) && result.risk_flags.length) {
    lines.push("## Risk Flags");
    result.risk_flags.forEach((risk) => {
      lines.push(`### ${risk.title} (${risk.severity})`);
      (risk.points || []).forEach((point) => lines.push(`- ${point}`));
      if (risk.page_refs?.length) {
        lines.push(`Pages: ${risk.page_refs.join(", ")}`);
      }
      lines.push("");
    });
  }

  if (Array.isArray(result.viva_questions) && result.viva_questions.length) {
    lines.push("## Viva Questions");
    result.viva_questions.forEach((question) => lines.push(`- ${question}`));
    lines.push("");
  }

  return lines.join("\n");
}

function CompactBrand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#101820] text-sm font-semibold text-white">
        D
      </div>
      <div>
        <p className="text-base font-semibold text-[#101820]">DocuMind</p>
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
          Document Intelligence
        </p>
      </div>
    </div>
  );
}

function App() {
  const [view, setView] = useState("landing");
  const [currentMode, setCurrentMode] = useState("legal");
  const [researchSubmode, setResearchSubmode] = useState("single");
  const [legalFile, setLegalFile] = useState(null);
  const [researchFile, setResearchFile] = useState(null);
  const [compareFiles, setCompareFiles] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewTarget, setPreviewTarget] = useState("single");
  const [backendStatus, setBackendStatus] = useState("checking");

  const workspaceCopy = getWorkspaceCopy(currentMode, researchSubmode);

  useEffect(() => {
    let active = true;

    async function checkBackendHealth() {
      try {
        await axios.get(`${API_BASE_URL}/health`);
        if (active) {
          setBackendStatus("connected");
        }
      } catch {
        if (active) {
          setBackendStatus("disconnected");
        }
      }
    }

    checkBackendHealth();
    const intervalId = window.setInterval(checkBackendHealth, 5000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const selectedFiles = useMemo(() => {
    if (currentMode === "research" && researchSubmode === "compare") {
      return compareFiles;
    }

    if (currentMode === "research") {
      return researchFile;
    }

    return legalFile;
  }, [compareFiles, currentMode, legalFile, researchFile, researchSubmode]);

  const previewOptions = useMemo(() => {
    if (currentMode === "research" && researchSubmode === "compare") {
      return compareFiles.map((file, index) => ({
        key: index === 0 ? "paper_a" : "paper_b",
        label: index === 0 ? "Paper A" : "Paper B",
        file,
      }));
    }

    return [];
  }, [compareFiles, currentMode, researchSubmode]);

  const previewFile = useMemo(() => {
    if (currentMode === "research" && researchSubmode === "compare") {
      return (
        previewOptions.find((option) => option.key === previewTarget)?.file || null
      );
    }

    return currentMode === "research" ? researchFile : legalFile;
  }, [
    currentMode,
    legalFile,
    previewOptions,
    previewTarget,
    researchFile,
    researchSubmode,
  ]);

  function resetAnalysis(nextTarget = "single") {
    setAnalysisResult(null);
    setError("");
    setCurrentPage(1);
    setPreviewTarget(nextTarget);
  }

  function handleStartMode(mode) {
    setCurrentMode(mode);
    setResearchSubmode("single");
    setView("workspace");
    resetAnalysis("single");
  }

  function handleModeChange(mode) {
    setCurrentMode(mode);
    if (mode !== "research") {
      setResearchSubmode("single");
    }
    resetAnalysis("single");
  }

  function handleResearchSubmodeChange(nextSubmode) {
    setResearchSubmode(nextSubmode);
    resetAnalysis(nextSubmode === "compare" ? "paper_a" : "single");
  }

  function handleFilesSelected(selection) {
    if (currentMode === "research" && researchSubmode === "compare") {
      setCompareFiles(Array.isArray(selection) ? selection.slice(0, 2) : []);
      resetAnalysis("paper_a");
      return;
    }

    if (currentMode === "research") {
      setResearchFile(selection);
      resetAnalysis("single");
      return;
    }

    setLegalFile(selection);
    resetAnalysis("single");
  }

  async function handleUpload() {
    const formData = new FormData();
    let endpoint = "/analyze";

    if (currentMode === "research" && researchSubmode === "compare") {
      if (compareFiles.length !== 2) {
        setError("Please choose exactly 2 research PDFs for comparison.");
        return;
      }

      endpoint = "/research/compare";
      compareFiles.forEach((file) => formData.append("files", file));
    } else if (currentMode === "research") {
      if (!researchFile) {
        setError("Please choose a research PDF first.");
        return;
      }

      endpoint = "/research/analyze";
      formData.append("file", researchFile);
    } else {
      if (!legalFile) {
        setError("Please choose a PDF file first.");
        return;
      }

      formData.append("file", legalFile);
    }

    setLoading(true);
    setError("");
    setAnalysisResult(null);

    try {
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setAnalysisResult(response.data);
      setCurrentPage(1);
      setPreviewTarget(
        currentMode === "research" && researchSubmode === "compare"
          ? "paper_a"
          : "single"
      );
    } catch (uploadError) {
      setAnalysisResult(null);
      setError(getErrorMessage(uploadError));
    } finally {
      setLoading(false);
    }
  }

  function handlePageSelect(page, target = "single") {
    setPreviewTarget(target);
    setCurrentPage(page);
  }

  async function handleCopyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setError("Unable to copy this content right now.");
    }
  }

  function handleExportJson() {
    if (!analysisResult) {
      return;
    }

    downloadTextFile(
      "documind-analysis.json",
      JSON.stringify(analysisResult, null, 2),
      "application/json"
    );
  }

  function handleExportMarkdown() {
    if (!analysisResult) {
      return;
    }

    downloadTextFile(
      "documind-analysis.md",
      buildMarkdownExport(analysisResult),
      "text/markdown"
    );
  }

  if (view === "landing") {
    return <LandingPage onStartMode={handleStartMode} />;
  }

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#101820]">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-[#f7f4ee]/88 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 py-3 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CompactBrand />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setView("landing")}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#101820] hover:text-[#101820]"
              >
                Home
              </button>
              <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                Text-based English PDFs
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => handleModeChange("legal")}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                  currentMode === "legal"
                    ? "bg-[#101820] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Legal Review
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("research")}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                  currentMode === "research"
                    ? "bg-[#101820] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Research Review
              </button>
            </div>

            {currentMode === "research" ? (
              <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[#d4e7ca] bg-[#edf5e7] p-1">
                <button
                  type="button"
                  onClick={() => handleResearchSubmodeChange("single")}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                    researchSubmode === "single"
                      ? "bg-white text-[#315f54]"
                      : "text-[#4f8f82] hover:bg-white/70"
                  }`}
                >
                  Single Paper
                </button>
                <button
                  type="button"
                  onClick={() => handleResearchSubmodeChange("compare")}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                    researchSubmode === "compare"
                      ? "bg-white text-[#315f54]"
                      : "text-[#4f8f82] hover:bg-white/70"
                  }`}
                >
                  Compare 2 Papers
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <section className="mb-8 border-b border-slate-200 pb-6">
          <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f8f82]">
                {workspaceCopy.eyebrow}
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight text-[#101820] lg:text-5xl">
                {workspaceCopy.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                {workspaceCopy.description}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Reading Flow
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Preview the source first, then read the structured analysis in a
                wider layout below.
              </p>
              <div className="mt-4">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    backendStatus === "connected"
                      ? "bg-[#edf5e7] text-[#315f54]"
                      : backendStatus === "disconnected"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {backendStatus === "connected"
                    ? "Backend connected"
                    : backendStatus === "disconnected"
                      ? "Backend unreachable"
                      : "Checking backend"}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <UploadBox
            title={workspaceCopy.uploadTitle}
            description={workspaceCopy.uploadDescription}
            selectedFiles={selectedFiles}
            loading={loading}
            error={error}
            allowMultiple={
              currentMode === "research" && researchSubmode === "compare"
            }
            onFilesSelected={handleFilesSelected}
            onUpload={handleUpload}
            actionLabel={workspaceCopy.actionLabel}
            loadingLabel={workspaceCopy.loadingLabel}
          />

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_36px_rgba(16,24,32,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f8f82]">
              Workspace Guide
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[#101820]">
              What happens next
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                1. Upload one PDF for review, or exactly two PDFs for research
                comparison.
              </p>
              <p>
                2. Preview the source document before reading the structured
                analysis.
              </p>
              <p>
                3. Use page-linked chips to jump between the analysis and the
                source pages.
              </p>
              <p>
                4. Export the result as JSON or Markdown when you need to reuse
                it outside the app.
              </p>
            </div>
          </section>
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-[0_10px_30px_rgba(16,24,32,0.04)] lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f8f82]">
                Document Preview
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#101820]">
                Source document
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              Active file:{" "}
              <span className="font-semibold text-[#101820]">
                {previewFile ? previewFile.name : "No file selected"}
              </span>
            </p>
          </div>

          <div className="mt-5">
            <PdfViewer
              file={previewFile}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              previewOptions={previewOptions}
              activePreviewTarget={previewTarget}
              onPreviewTargetChange={setPreviewTarget}
              currentFileLabel={previewFile ? previewFile.name : "No file selected"}
            />
          </div>
        </section>

        <section className="mt-8">
          <AnalysisPanel
            result={analysisResult}
            loading={loading}
            error={error}
            activePage={currentPage}
            activeTarget={previewTarget}
            onPageSelect={handlePageSelect}
            currentMode={currentMode}
            researchSubmode={researchSubmode}
            onCopyText={handleCopyText}
            onExportJson={handleExportJson}
            onExportMarkdown={handleExportMarkdown}
          />
        </section>

        <section className="mt-8 border-t border-slate-200 py-5 text-sm text-slate-500">
          DocuMind currently supports text-based English PDFs. Scanned documents
          and OCR are outside this workspace version.
        </section>
      </main>
    </div>
  );
}

export default App;
