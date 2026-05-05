function UploadBox({
  title,
  description,
  selectedFiles,
  loading,
  error,
  allowMultiple = false,
  onFilesSelected,
  onUpload,
  actionLabel,
  loadingLabel,
}) {
  function handleFileChange(event) {
    const files = Array.from(event.target.files || []);
    onFilesSelected(allowMultiple ? files.slice(0, 2) : files[0] || null);
  }

  const chosenFiles = Array.isArray(selectedFiles)
    ? selectedFiles.filter(Boolean)
    : selectedFiles
      ? [selectedFiles]
      : [];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f8f82]">
            Upload
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[#101820]">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            {description}
          </p>
        </div>

        <div className="rounded-md border border-[#d4e7ca] bg-[#edf5e7] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#315f54]">
          Upload first
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-[#faf9f5] p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <input
            type="file"
            accept="application/pdf"
            multiple={allowMultiple}
            onChange={handleFileChange}
            disabled={loading}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-[#101820] file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-[#263238]"
          />
          <button
            type="button"
            onClick={onUpload}
            disabled={loading}
            className="inline-flex min-w-[170px] items-center justify-center rounded-md bg-[#101820] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#263238] disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? loadingLabel : actionLabel}
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3 text-sm">
        <p className="text-slate-600">
          Selected document{chosenFiles.length === 1 ? "" : "s"}:{" "}
          <span className="font-medium text-slate-900">
            {chosenFiles.length
              ? chosenFiles.map((file) => file.name).join(", ")
              : "None"}
          </span>
        </p>

        {!chosenFiles.length && !error ? (
          <p className="rounded-lg border border-slate-200 bg-[#faf9f5] px-4 py-3 text-slate-500">
            {allowMultiple
              ? "Select exactly two PDFs from your computer. The comparison workspace will keep the preview and page-linked comparison board in sync."
              : "Start by selecting a PDF from your computer. The workspace will sync the preview and structured analysis after upload."}
          </p>
        ) : null}

        {loading ? (
          <p className="rounded-lg border border-[#d4e7ca] bg-[#edf5e7] px-4 py-3 text-[#315f54]">
            {allowMultiple
              ? "Uploading both files, extracting page text, and preparing the comparison board..."
              : "Uploading the file, extracting page text, and preparing the analysis..."}
          </p>
        ) : null}

        {!loading && chosenFiles.length ? (
          <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-500">
            The document is ready to analyze. Once the response appears below,
            you can export it as JSON or Markdown.
          </p>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default UploadBox;
