# ICP Classification Backend

FastAPI backend for the ICP Classification webapp.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Run

Start the development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## API Endpoints

- `POST /api/upload` - Upload CSV and create session
- `GET /api/session/{id}` - Get session details
- `GET /api/session/{id}/websites` - Get batch of websites
- `POST /api/classify` - Record classification
- `POST /api/undo` - Undo last classification
- `GET /api/export/{id}` - Export results as CSV
- `GET /api/proxy` - Proxy website content

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app
│   ├── config.py            # Configuration
│   ├── models/              # Pydantic models
│   ├── routes/              # API endpoints
│   ├── services/            # Business logic
│   └── utils/               # Utilities
├── data/                    # Data storage
│   ├── sessions/            # Session JSON files
│   └── uploads/             # Uploaded CSV files
└── requirements.txt
```
