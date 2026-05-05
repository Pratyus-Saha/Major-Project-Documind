# Frontend

The frontend provides a single-page demo UI with:

- PDF upload
- first-page PDF preview
- structured analysis panel for legal and research outputs

## Setup

```powershell
cd "C:\Users\assas\Desktop\Major PA Documind\frontend"
cmd /c npm install
```

## Run

```powershell
cmd /c npm start
```

The app starts on:

- `http://localhost:3000`

## Backend URL

By default, the frontend sends requests to:

- `http://127.0.0.1:8000`

Optional override:

```env
REACT_APP_API_BASE_URL=http://127.0.0.1:8000
```

## Known Limitations

- PDF preview renders only the first page
- The UI is demo-focused and uses a single upload flow
- No advanced viewer controls, highlighting, or multi-page navigation yet
