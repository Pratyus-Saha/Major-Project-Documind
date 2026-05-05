const heroImage =
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=2200&q=85";

function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#101820] text-sm font-semibold text-white">
        D
      </div>
      <span className="text-lg font-semibold text-[#101820]">DocuMind</span>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="text-3xl font-semibold text-[#101820]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{label}</p>
    </div>
  );
}

function FeatureBlock({ title, description }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="h-1.5 w-12 rounded-full bg-[#4f8f82]" />
      <h3 className="mt-6 text-xl font-semibold text-[#101820]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
    </article>
  );
}

function SolutionBlock({ title, eyebrow, description, onClick }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f8f82]">
        {eyebrow}
      </p>
      <h3 className="mt-4 text-2xl font-semibold text-[#101820]">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>
      <button
        type="button"
        onClick={onClick}
        className="mt-7 rounded-md bg-[#101820] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#263238]"
      >
        Open workspace
      </button>
    </article>
  );
}

function ProcessStep({ number, title, description }) {
  return (
    <div className="border-t border-slate-200 pt-5">
      <p className="text-sm font-semibold text-[#4f8f82]">{number}</p>
      <h3 className="mt-3 text-lg font-semibold text-[#101820]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
    </div>
  );
}

function FAQItem({ question, answer }) {
  return (
    <details className="group border-t border-slate-200 py-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-base font-semibold text-[#101820]">
        {question}
        <span className="text-xl font-light text-slate-400 transition group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{answer}</p>
    </details>
  );
}

function LandingPage({ onStartMode }) {
  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#101820]">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f7f4ee]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <LogoMark />
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
            <a href="#platform" className="transition hover:text-[#101820]">
              Platform
            </a>
            <a href="#solutions" className="transition hover:text-[#101820]">
              Solutions
            </a>
            <a href="#workflow" className="transition hover:text-[#101820]">
              How it works
            </a>
            <a href="#faq" className="transition hover:text-[#101820]">
              FAQ
            </a>
          </nav>
          <button
            type="button"
            onClick={() => onStartMode?.("research")}
            className="rounded-md bg-[#101820] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#263238]"
          >
            Start analysis
          </button>
        </div>
      </header>

      <main>
        <section
          className="relative min-h-[760px] overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(16,24,32,0.78), rgba(16,24,32,0.46), rgba(16,24,32,0.2)), url(${heroImage})`,
          }}
        >
          <div className="mx-auto flex min-h-[760px] max-w-7xl items-center px-5 py-20 lg:px-8">
            <div className="max-w-3xl pt-12 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d7efc5]">
                Understand documents without the document fatigue
              </p>
              <h1 className="mt-6 text-6xl font-semibold leading-[1.02] sm:text-7xl lg:text-8xl">
                DocuMind
              </h1>
              <p className="mt-6 max-w-2xl text-xl leading-9 text-white/86">
                A structured document intelligence platform that turns legal
                files, research papers, and dense PDFs into clear summaries,
                grounded sections, page references, and exportable insight.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onStartMode?.("research")}
                  className="rounded-md bg-[#d7efc5] px-6 py-4 text-sm font-semibold text-[#101820] transition hover:bg-white"
                >
                  Analyze a document
                </button>
                <a
                  href="#solutions"
                  className="rounded-md border border-white/45 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white hover:text-[#101820]"
                >
                  Explore solutions
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f7f4ee] px-5 py-8 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 border-b border-slate-200 pb-8 sm:grid-cols-3">
            <Stat value="3" label="Focused workspaces for legal review, research analysis, and paper comparison." />
            <Stat value="2" label="Export formats included today: structured JSON and clean Markdown." />
            <Stat value="1" label="Reading flow built around preview first, then full-width analysis." />
          </div>
        </section>

        <section id="platform" className="px-5 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4f8f82]">
                Platform
              </p>
              <h2 className="mt-5 text-4xl font-semibold leading-tight text-[#101820] sm:text-5xl">
                Built for people who need to understand documents, not just
                store them.
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                DocuMind keeps document context visible while turning analysis
                into structured points, page references, comparison sections,
                and shareable exports.
              </p>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-3">
              <FeatureBlock
                title="Structured by default"
                description="Summaries, clauses, methods, findings, risks, and research gaps are presented as readable points instead of dense paragraphs."
              />
              <FeatureBlock
                title="Grounded to pages"
                description="Every supported insight can link back to the page that supports it, so users can verify instead of guessing."
              />
              <FeatureBlock
                title="Ready to share"
                description="Copy a section, export a session bundle, and leave the workspace with structured output you can reuse immediately."
              />
            </div>
          </div>
        </section>

        <section id="solutions" className="bg-white px-5 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4f8f82]">
                  Solutions
                </p>
                <h2 className="mt-5 text-4xl font-semibold leading-tight text-[#101820] sm:text-5xl">
                  Choose the review path that matches the document.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-slate-600">
                The same platform experience adapts to legal review, research
                reading, and two-paper comparison without making users learn a
                different tool each time.
              </p>
            </div>

            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              <SolutionBlock
                eyebrow="Legal"
                title="Contract and agreement review"
                description="Extract payment terms, termination language, liability sections, confidentiality terms, and risk flags in a readable board."
                onClick={() => onStartMode?.("legal")}
              />
              <SolutionBlock
                eyebrow="Research"
                title="Single-paper academic review"
                description="Understand methodology, data, findings, novelty, limitations, gaps, future work, and viva questions from one paper."
                onClick={() => onStartMode?.("research")}
              />
              <SolutionBlock
                eyebrow="Compare"
                title="Two-paper comparison"
                description="Compare exactly two papers by methods, findings, limitations, research gaps, strengths, and final synthesis."
                onClick={() => onStartMode?.("research")}
              />
            </div>
          </div>
        </section>

        <section id="workflow" className="px-5 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4f8f82]">
                  How it works
                </p>
                <h2 className="mt-5 text-4xl font-semibold leading-tight text-[#101820] sm:text-5xl">
                  A calmer workflow for dense reading.
                </h2>
              </div>
              <div className="grid gap-8 sm:grid-cols-2">
                <ProcessStep
                  number="01"
                  title="Upload"
                  description="Choose a text-based English PDF in the workspace mode that fits the task."
                />
                <ProcessStep
                  number="02"
                  title="Preview"
                  description="Read the document first with a stable page preview and page controls."
                />
                <ProcessStep
                  number="03"
                  title="Analyze"
                  description="Review structured points below the preview in a wide reading layout."
                />
                <ProcessStep
                  number="04"
                  title="Use"
                  description="Jump to pages, add session notes, bookmark pages, and export the current session cleanly."
                />
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="bg-white px-5 py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4f8f82]">
                FAQ
              </p>
              <h2 className="mt-5 text-4xl font-semibold leading-tight text-[#101820]">
                Questions before you start.
              </h2>
            </div>
            <div>
              <FAQItem
                question="What documents does DocuMind support today?"
                answer="This version supports text-based English PDFs. Scanned documents and OCR are planned separately so the core reading experience can stay reliable first."
              />
              <FAQItem
                question="Does DocuMind replace legal or academic judgment?"
                answer="No. DocuMind helps structure and ground document understanding, but users should still verify important conclusions in the source PDF."
              />
              <FAQItem
                question="Can I compare more than two research papers?"
                answer="The current comparison workflow is intentionally built for exactly two papers so the output stays readable and evidence-linked."
              />
            </div>
          </div>
        </section>

        <section className="px-5 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl bg-[#101820] px-6 py-16 text-white sm:px-10">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <h2 className="text-4xl font-semibold leading-tight">
                  Start with the document. Leave with the structure.
                </h2>
                <p className="mt-5 text-base leading-8 text-white/72">
                  Open the workspace, upload a PDF, and turn dense reading into
                  a clear board of points, sections, risks, and page references.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onStartMode?.("research")}
                className="rounded-md bg-[#d7efc5] px-6 py-4 text-sm font-semibold text-[#101820] transition hover:bg-white"
              >
                Open DocuMind
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 px-5 py-10 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 text-sm text-slate-500 md:flex-row">
          <LogoMark />
          <p>Structured document intelligence for clearer reading.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
