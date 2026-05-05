import { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PdfViewer({
  file,
  currentPage,
  onPageChange,
  previewOptions = [],
  activePreviewTarget = "single",
  onPreviewTargetChange,
  currentFileLabel = "No file selected",
}) {
  const [loadError, setLoadError] = useState("");
  const [numPages, setNumPages] = useState(null);

  const documentFile = useMemo(() => file || null, [file]);

  useEffect(() => {
    if (!documentFile) {
      setNumPages(null);
      setLoadError("");
    }
  }, [documentFile]);

  function handleLoadSuccess({ numPages: totalPages }) {
    setNumPages(totalPages);
    setLoadError("");
    if (!currentPage || currentPage > totalPages) {
      onPageChange?.(1);
    }
  }

  function handleLoadError() {
    setNumPages(null);
    setLoadError("Unable to preview this PDF.");
  }

  if (!documentFile) {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-[#faf9f5] p-8 text-center text-sm text-slate-500">
        Select a PDF to preview pages here before analysis starts.
      </div>
    );
  }

  const safePage = currentPage || 1;
  const canGoBackward = safePage > 1;
  const canGoForward = Boolean(numPages && safePage < numPages);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-[#faf9f5] p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f8f82]">
              Preview Navigation
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Use the controls or analysis page chips to move through the
              document.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {previewOptions.length > 1 ? (
              <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-[#faf9f5] p-1">
                {previewOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => onPreviewTargetChange?.(option.key)}
                    className={`rounded-md px-3 py-2 text-xs font-semibold transition ${
                      option.key === activePreviewTarget
                        ? "bg-[#101820] text-white"
                        : "bg-transparent text-slate-600 hover:bg-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => onPageChange?.(safePage - 1)}
              disabled={!canGoBackward}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#101820] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => onPageChange?.(safePage + 1)}
              disabled={!canGoForward}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#101820] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <Document
          file={documentFile}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={handleLoadError}
          loading={
            <div className="flex min-h-[420px] items-center justify-center text-sm text-slate-500">
              Loading the PDF preview...
            </div>
          }
          error={
            <div className="flex min-h-[420px] items-center justify-center text-sm text-rose-600">
              The PDF preview could not be shown for this file.
            </div>
          }
          noData={
            <div className="flex min-h-[420px] items-center justify-center text-sm text-slate-500">
              No PDF selected.
            </div>
          }
        >
          <Page
            pageNumber={safePage}
            width={640}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            loading={
              <div className="flex min-h-[420px] items-center justify-center text-sm text-slate-500">
                Rendering the first page preview...
              </div>
            }
          />
        </Document>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
        <p className="mb-2">
          Active document:{" "}
          <span className="font-medium text-slate-900">{currentFileLabel}</span>
        </p>
        <p>
          Showing:{" "}
          <span className="font-medium text-slate-900">Page {safePage}</span>
          {numPages ? (
            <span>
              {" "}
              of <span className="font-medium text-slate-900">{numPages}</span>
            </span>
          ) : null}
        </p>
        {loadError ? (
          <p className="mt-2 text-rose-600">
            {loadError} You can still review the analysis result below.
          </p>
        ) : (
          <p className="mt-2 text-slate-500">
            This viewer keeps one focused page on screen at a time for a calmer
            reading experience.
          </p>
        )}
      </div>
    </div>
  );
}

export default PdfViewer;
