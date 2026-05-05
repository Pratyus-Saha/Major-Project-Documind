# Backend

The backend accepts a PDF upload, extracts page-wise text with PyMuPDF, classifies the document with rule-based logic, sends a mode-specific prompt to Gemini, and returns a normalized JSON response.

## Setup

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
# Optional:
# GEMINI_MODEL=gemini-1.5-flash
```

## Run

```powershell
uvicorn app.main:app --reload
```

## Endpoints

- `GET /health`
- `POST /analyze`

## Health Check

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
```

## Analyze Request

- Content type: `multipart/form-data`
- Field name: `file`

## Known Limitations

- Supports only text-based English PDFs
- Encrypted and scanned PDFs are not supported
- Classification supports only `legal`, `research`, and `unknown`
- If Gemini returns invalid JSON twice, the backend falls back to a safe normalized response
