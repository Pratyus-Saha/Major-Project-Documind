# DocuMind MVP

DocuMind MVP is a professor-demo web app for uploading one text-based English PDF, previewing the first page, classifying it as `legal` or `research`, and showing Gemini-generated structured analysis.

## Stack

- Backend: FastAPI, PyMuPDF, Pydantic, Gemini
- Frontend: React, Tailwind CSS, Axios, react-pdf

## Quick Start

### 1. Backend

```powershell
cd "C:\Users\assas\Desktop\Major PA Documind\backend"
py -3.11 -m venv .venv
.\.venv\Scripts\activate
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Open `backend\.env` and set:

```env
GEMINI_API_KEY=your_real_gemini_api_key
```

Then run:

```powershell
uvicorn app.main:app --reload
```

### 2. Frontend

```powershell
cd "C:\Users\assas\Desktop\Major PA Documind\frontend"
cmd /c npm install
cmd /c npm start
```

### 3. Open the App

- Frontend: `http://localhost:3000`
- Backend health check: `http://127.0.0.1:8000/health`

## Demo Flow

1. Choose a PDF in the upload box.
2. Click `Analyze PDF`.
3. The frontend updates both the first-page preview and the analysis panel.
4. The backend returns a normalized JSON response for `legal`, `research`, or `unknown`.

## Known Limitations

- Supports only text-based English PDFs
- No OCR or scanned PDF support
- First-page preview only
- No auth, history, database persistence, chat, embeddings, or FAISS
- Demo-focused error handling and local temporary file storage only

## Notes

- Python 3.11+ must be installed before backend setup can run.
- On this machine, `npm` should be run through `cmd /c npm ...` from PowerShell.
