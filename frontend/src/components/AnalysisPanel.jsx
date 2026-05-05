import StructuredPoints from "./StructuredPoints";

function SectionTitle({ children }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
      {children}
    </p>
  );
}

function ActionButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 transition hover:bg-[#101820] hover:text-white"
    >
      {children}
    </button>
  );
}

function PageChip({
  label,
  page,
  target = "single",
  targetLabel,
  activePage,
  activeTarget,
  onPageSelect,
}) {
  const isActive = activePage === page && activeTarget === target;

  return (
    <button
      type="button"
      onClick={() => onPageSelect?.(page, target)}
      className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
        isActive
          ? "bg-[#101820] text-white"
          : "border border-slate-200 bg-white text-slate-600 hover:border-[#101820] hover:text-[#101820]"
      }`}
    >
      {targetLabel ? `${targetLabel} - ` : ""}
      {label} - Page {page}
    </button>
  );
}

function buildCopyText(title, points) {
  const safePoints = Array.isArray(points) ? points.filter(Boolean) : [];
  return [title, ...safePoints.map((point) => `- ${point}`)].join("\n");
}

function SummaryBoard({ points, onCopy }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-[#faf9f5] p-5 shadow-[0_8px_24px_rgba(16,24,32,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle>Summary</SectionTitle>
        <ActionButton onClick={onCopy}>Copy Summary</ActionButton>
      </div>
      <div className="mt-4">
        <StructuredPoints points={points} emptyText="No summary available." />
      </div>
    </article>
  );
}

function SectionCard({
  title,
  points,
  pageRefs,
  activePage,
  activeTarget,
  onPageSelect,
  onCopy,
  sectionId,
  target = "single",
  targetLabel,
}) {
  const safePages = Array.isArray(pageRefs) ? pageRefs : [];

  return (
    <article
      id={sectionId}
      className="rounded-3xl border border-slate-200 bg-[#faf9f5] p-5 shadow-[0_8px_24px_rgba(16,24,32,0.04)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <SectionTitle>Section</SectionTitle>
          <h3 className="mt-2 text-lg font-semibold text-[#101820]">{title}</h3>
        </div>
        <ActionButton onClick={onCopy}>Copy Section</ActionButton>
      </div>

      <div className="mt-4">
        <StructuredPoints points={points} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {safePages.length ? (
          safePages.map((page) => (
            <PageChip
              key={`${title}-${page}`}
              label={title}
              page={page}
              target={target}
              targetLabel={targetLabel}
              activePage={activePage}
              activeTarget={activeTarget}
              onPageSelect={onPageSelect}
            />
          ))
        ) : (
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
            No page refs
          </p>
        )}
      </div>
    </article>
  );
}

function ComparisonCard({
  title,
  section,
  activePage,
  activeTarget,
  onPageSelect,
  onCopy,
  sectionId,
}) {
  const paperAPages = Array.isArray(section?.paper_a_pages)
    ? section.paper_a_pages
    : [];
  const paperBPages = Array.isArray(section?.paper_b_pages)
    ? section.paper_b_pages
    : [];

  return (
    <article
      id={sectionId}
      className="rounded-3xl border border-slate-200 bg-[#faf9f5] p-5 shadow-[0_8px_24px_rgba(16,24,32,0.04)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <SectionTitle>Comparison</SectionTitle>
          <h3 className="mt-2 text-lg font-semibold text-[#101820]">{title}</h3>
        </div>
        <ActionButton onClick={onCopy}>Copy Section</ActionButton>
      </div>

      <div className="mt-4">
        <StructuredPoints points={section?.points} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {paperAPages.map((page) => (
          <PageChip
            key={`a-${title}-${page}`}
            label={title}
            page={page}
            target="paper_a"
            targetLabel="Paper A"
            activePage={activePage}
            activeTarget={activeTarget}
            onPageSelect={onPageSelect}
          />
        ))}
        {paperBPages.map((page) => (
          <PageChip
            key={`b-${title}-${page}`}
            label={title}
            page={page}
            target="paper_b"
            targetLabel="Paper B"
            activePage={activePage}
            activeTarget={activeTarget}
            onPageSelect={onPageSelect}
          />
        ))}
      </div>
    </article>
  );
}

function EmptyState({ currentMode, researchSubmode }) {
  const text =
    currentMode === "research" && researchSubmode === "compare"
      ? "Upload exactly two research papers to see the comparison board here."
      : currentMode === "research"
        ? "Upload one research paper to see the academic review here."
        : "Upload a legal PDF to see the structured review here.";

  return (
    <section className="min-h-[420px] rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-[0_10px_30px_rgba(16,24,32,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f8f82]">
        Analysis
      </p>
      <h2 className="mt-4 text-3xl font-semibold text-[#101820]">
        Structured analysis will appear here
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">
        {text}
      </p>
    </section>
  );
}

function LoadingState({ currentMode, researchSubmode }) {
  const title =
    currentMode === "research" && researchSubmode === "compare"
      ? "Preparing comparison"
      : currentMode === "research"
        ? "Preparing research review"
        : "Preparing legal review";

  return (
    <section className="min-h-[420px] rounded-3xl border border-slate-200 bg-white p-10 shadow-[0_10px_30px_rgba(16,24,32,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f8f82]">
        Analysis
      </p>
      <h2 className="mt-4 text-3xl font-semibold text-[#101820]">{title}</h2>
      <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
        DocuMind is extracting text, organizing the response, and preparing the
        reading board.
      </p>
      <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-[#4f8f82]" />
      </div>
    </section>
  );
}

function ErrorState({ error }) {
  return (
    <section className="min-h-[320px] rounded-3xl border border-rose-200 bg-white p-10 shadow-[0_10px_30px_rgba(16,24,32,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
        Analysis Error
      </p>
      <h2 className="mt-4 text-3xl font-semibold text-[#101820]">
        The analysis could not be completed
      </h2>
      <p className="mt-4 max-w-3xl rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-base leading-8 text-rose-700">
        {error}
      </p>
    </section>
  );
}

function Toolbar({ onExportJson, onExportMarkdown }) {
  return (
    <div className="flex flex-wrap gap-2">
      <ActionButton onClick={onExportJson}>Export JSON</ActionButton>
      <ActionButton onClick={onExportMarkdown}>Export Markdown</ActionButton>
    </div>
  );
}

function LegacyBoard({
  result,
  activePage,
  activeTarget,
  onPageSelect,
  onCopyText,
  onExportJson,
  onExportMarkdown,
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(16,24,32,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f8f82]">
            {result.document_type === "legal" ? "Legal Review" : "Research Review"}
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-[#101820]">
            Structured document analysis
          </h2>
        </div>
        <Toolbar
          onExportJson={onExportJson}
          onExportMarkdown={onExportMarkdown}
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <div className="xl:col-span-2">
          <SummaryBoard
            points={result.summary_points}
            onCopy={() =>
              onCopyText?.(buildCopyText("Summary", result.summary_points || []))
            }
          />
        </div>

        {(result.sections || []).map((section) => (
          <SectionCard
            key={section.key}
            sectionId={`section-${section.key}`}
            title={section.title}
            points={section.points}
            pageRefs={section.page_refs}
            activePage={activePage}
            activeTarget={activeTarget}
            onPageSelect={onPageSelect}
            onCopy={() =>
              onCopyText?.(buildCopyText(section.title, section.points || []))
            }
          />
        ))}
      </div>

      {result.document_type === "legal" && (result.risk_flags || []).length ? (
        <div className="mt-6 rounded-3xl border border-amber-200 bg-[#fff8eb] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <SectionTitle>Risk Flags</SectionTitle>
              <h3 className="mt-2 text-lg font-semibold text-[#101820]">
                Review-sensitive items
              </h3>
            </div>
            <ActionButton
              onClick={() =>
                onCopyText?.(
                  buildCopyText(
                    "Risk Flags",
                    result.risk_flags.flatMap((risk) => risk.points || [])
                  )
                )
              }
            >
              Copy Risks
            </ActionButton>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {result.risk_flags.map((risk, index) => (
              <article
                key={`${risk.title}-${index}`}
                className="rounded-2xl border border-amber-100 bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-base font-semibold text-[#101820]">
                    {risk.title}
                  </h4>
                  <span className="rounded-full border border-amber-200 bg-[#fff8eb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
                    {risk.severity}
                  </span>
                </div>
                <div className="mt-3">
                  <StructuredPoints points={risk.points} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(risk.page_refs || []).map((page) => (
                    <PageChip
                      key={`${risk.title}-${page}`}
                      label={risk.title}
                      page={page}
                      activePage={activePage}
                      activeTarget={activeTarget}
                      onPageSelect={onPageSelect}
                    />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {result.document_type === "research" && (result.viva_questions || []).length ? (
        <div className="mt-6 rounded-3xl border border-[#d4e7ca] bg-[#edf5e7] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <SectionTitle>Viva Questions</SectionTitle>
              <h3 className="mt-2 text-lg font-semibold text-[#101820]">
                Study-focused prompts
              </h3>
            </div>
            <ActionButton
              onClick={() =>
                onCopyText?.(
                  buildCopyText("Viva Questions", result.viva_questions || [])
                )
              }
            >
              Copy Questions
            </ActionButton>
          </div>
          <div className="mt-4 rounded-2xl border border-[#d4e7ca] bg-white p-4">
            <StructuredPoints
              points={result.viva_questions}
              emptyText="No viva questions available."
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ResearchBoard(props) {
  const {
    result,
    activePage,
    activeTarget,
    onPageSelect,
    onCopyText,
    onExportJson,
    onExportMarkdown,
  } = props;

  const sections = [
    ["Problem Statement", result.problem_statement],
    ["Methodology", result.methodology],
    ["Dataset or Sample", result.dataset_or_sample],
    ["Key Findings", result.key_findings],
    ["Limitations", result.limitations],
    ["Novelty", result.novelty],
    ["Research Gaps", result.research_gaps],
    ["Future Work", result.future_work],
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(16,24,32,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f8f82]">
            Research Review
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-[#101820]">
            Single-paper academic review
          </h2>
        </div>
        <Toolbar
          onExportJson={onExportJson}
          onExportMarkdown={onExportMarkdown}
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-slate-200 bg-[#faf9f5] p-5 shadow-[0_8px_24px_rgba(16,24,32,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <SectionTitle>Title</SectionTitle>
              <h3 className="mt-2 text-lg font-semibold text-[#101820]">
                {result.title || "Not found in document"}
              </h3>
            </div>
            <ActionButton
              onClick={() => onCopyText?.(result.title || "No title available")}
            >
              Copy Title
            </ActionButton>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(result.title_page_refs || []).map((page) => (
              <PageChip
                key={`title-${page}`}
                label="Title"
                page={page}
                activePage={activePage}
                activeTarget={activeTarget}
                onPageSelect={onPageSelect}
              />
            ))}
          </div>
        </article>

        <SummaryBoard
          points={result.summary_points}
          onCopy={() =>
            onCopyText?.(buildCopyText("Summary", result.summary_points || []))
          }
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {sections.map(([title, section]) => (
          <SectionCard
            key={title}
            sectionId={`research-${title.toLowerCase().replaceAll(" ", "-")}`}
            title={title}
            points={section?.points}
            pageRefs={section?.page_refs}
            activePage={activePage}
            activeTarget={activeTarget}
            onPageSelect={onPageSelect}
            onCopy={() =>
              onCopyText?.(buildCopyText(title, section?.points || []))
            }
          />
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-[#d4e7ca] bg-[#edf5e7] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <SectionTitle>Viva Questions</SectionTitle>
            <h3 className="mt-2 text-lg font-semibold text-[#101820]">
              Study-focused prompts
            </h3>
          </div>
          <ActionButton
            onClick={() =>
              onCopyText?.(
                buildCopyText("Viva Questions", result.viva_questions || [])
              )
            }
          >
            Copy Questions
          </ActionButton>
        </div>
        <div className="mt-4 rounded-2xl border border-[#d4e7ca] bg-white p-4">
          <StructuredPoints
            points={result.viva_questions}
            emptyText="No viva questions available."
          />
        </div>
      </div>
    </section>
  );
}

function ResearchCompareBoard(props) {
  const {
    result,
    activePage,
    activeTarget,
    onPageSelect,
    onCopyText,
    onExportJson,
    onExportMarkdown,
  } = props;

  const comparisonCards = [
    ["Overlap", result.overlap],
    ["Methodology Differences", result.methodology_differences],
    ["Findings Differences", result.findings_differences],
    ["Gap Comparison", result.gap_comparison],
    ["Strengths By Paper", result.strengths_by_paper],
    ["Best Use Case By Paper", result.best_use_case_by_paper],
    ["Final Synthesis", result.final_synthesis],
  ];

  const paperCards = [
    ["Paper A", "paper_a", result.paper_a],
    ["Paper B", "paper_b", result.paper_b],
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(16,24,32,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f8f82]">
            Research Comparison
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-[#101820]">
            Two-paper side-by-side review
          </h2>
        </div>
        <Toolbar
          onExportJson={onExportJson}
          onExportMarkdown={onExportMarkdown}
        />
      </div>

      <div className="mt-6 grid gap-4">
        {comparisonCards.map(([title, section]) => (
          <ComparisonCard
            key={title}
            sectionId={`compare-${title.toLowerCase().replaceAll(" ", "-")}`}
            title={title}
            section={section}
            activePage={activePage}
            activeTarget={activeTarget}
            onPageSelect={onPageSelect}
            onCopy={() =>
              onCopyText?.(buildCopyText(title, section?.points || []))
            }
          />
        ))}
      </div>

      <div className="mt-6 grid gap-4 2xl:grid-cols-2">
        {paperCards.map(([label, target, paper]) => (
          <section
            key={target}
            className="rounded-3xl border border-slate-200 bg-[#faf9f5] p-5 shadow-[0_8px_24px_rgba(16,24,32,0.04)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <SectionTitle>{label}</SectionTitle>
                <h3 className="mt-2 text-lg font-semibold text-[#101820]">
                  {paper?.title || "Not found in document"}
                </h3>
              </div>
              <ActionButton
                onClick={() => onCopyText?.(paper?.title || "No title available")}
              >
                Copy Title
              </ActionButton>
            </div>

            <div className="mt-4">
              <SummaryBoard
                points={paper?.summary_points}
                onCopy={() =>
                  onCopyText?.(
                    buildCopyText(`${label} Summary`, paper?.summary_points || [])
                  )
                }
              />
            </div>

            <div className="mt-4 grid gap-4">
              {[
                ["Methodology", paper?.methodology],
                ["Dataset or Sample", paper?.dataset_or_sample],
                ["Key Findings", paper?.key_findings],
                ["Limitations", paper?.limitations],
                ["Research Gaps", paper?.research_gaps],
              ].map(([title, section]) => (
                <SectionCard
                  key={`${label}-${title}`}
                  sectionId={`${target}-${title.toLowerCase().replaceAll(" ", "-")}`}
                  title={title}
                  points={section?.points}
                  pageRefs={section?.page_refs}
                  activePage={activePage}
                  activeTarget={activeTarget}
                  onPageSelect={onPageSelect}
                  onCopy={() =>
                    onCopyText?.(
                      buildCopyText(`${label} ${title}`, section?.points || [])
                    )
                  }
                  target={target}
                  targetLabel={label}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function AnalysisPanel({
  result,
  loading,
  error,
  activePage,
  activeTarget = "single",
  onPageSelect,
  currentMode = "legal",
  researchSubmode = "single",
  onCopyText,
  onExportJson,
  onExportMarkdown,
}) {
  if (loading) {
    return (
      <LoadingState
        currentMode={currentMode}
        researchSubmode={researchSubmode}
      />
    );
  }

  if (error && !result) {
    return <ErrorState error={error} />;
  }

  if (!result) {
    return (
      <EmptyState
        currentMode={currentMode}
        researchSubmode={researchSubmode}
      />
    );
  }

  if (result.document_type === "research_compare") {
    return (
      <ResearchCompareBoard
        result={result}
        activePage={activePage}
        activeTarget={activeTarget}
        onPageSelect={onPageSelect}
        onCopyText={onCopyText}
        onExportJson={onExportJson}
        onExportMarkdown={onExportMarkdown}
      />
    );
  }

  if (
    currentMode === "research" &&
    researchSubmode === "single" &&
    result.problem_statement
  ) {
    return (
      <ResearchBoard
        result={result}
        activePage={activePage}
        activeTarget={activeTarget}
        onPageSelect={onPageSelect}
        onCopyText={onCopyText}
        onExportJson={onExportJson}
        onExportMarkdown={onExportMarkdown}
      />
    );
  }

  return (
    <LegacyBoard
      result={result}
      activePage={activePage}
      activeTarget={activeTarget}
      onPageSelect={onPageSelect}
      onCopyText={onCopyText}
      onExportJson={onExportJson}
      onExportMarkdown={onExportMarkdown}
    />
  );
}

export default AnalysisPanel;
