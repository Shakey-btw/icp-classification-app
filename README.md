# ICP Classification Webapp

A Tinder-like webapp for classifying websites as ICP (Ideal Customer Profile) or Not ICP. Built with Python FastAPI backend and Next.js frontend.

## Features

- Upload CSV files with website URLs
- Tinder-style classification interface
- Keyboard navigation (← Not ICP, → ICP)
- Undo functionality (Cmd+Z / Ctrl+Z)
- Preloading of next 10 websites for smooth experience
- Website preview in iframe with proxy support
- Export results as CSV with classifications
- Clean, minimal design

## Tech Stack

**Backend:**
- FastAPI (Python)
- Pandas for CSV processing
- HTTPX for async HTTP requests
- File-based session storage (JSON)

**Frontend:**
- Next.js 14+ with App Router
- React 18+ with TypeScript
- Tailwind CSS
- Zustand for state management
- react-hotkeys-hook for keyboard shortcuts

## Project Structure

```
Fun-ICP-FIT-APP/
├── backend/          # Python FastAPI backend
│   ├── app/          # Application code
│   ├── data/         # Session and upload storage
│   └── requirements.txt
├── frontend/         # Next.js frontend
│   ├── app/          # Pages (upload, classify, export)
│   ├── components/   # React components
│   ├── lib/          # API client, preloader
│   ├── store/        # Zustand state management
│   ├── hooks/        # Custom React hooks
│   └── types/        # TypeScript types
└── README.md
```

## Setup & Installation

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Usage

1. **Upload CSV**: Drag and drop or click to upload a CSV file containing website URLs
   - CSV must have a column named: url, URL, website, domain, or link
   - Maximum file size: 10MB

2. **Classify Websites**:
   - Use arrow keys to classify:
     - **← (Left Arrow)**: Not ICP
     - **→ (Right Arrow)**: ICP
   - Or click the buttons
   - Press **Cmd+Z** (Mac) or **Ctrl+Z** (Windows) to undo last classification

3. **Export Results**: Once all websites are classified, download the CSV with results
   - Original CSV data + new "ICP_Classification" column

## API Endpoints

- `POST /api/upload` - Upload CSV and create session
- `GET /api/session/{id}` - Get session details
- `GET /api/session/{id}/websites` - Get batch of websites
- `POST /api/classify` - Record classification
- `POST /api/undo` - Undo last classification
- `GET /api/export/{id}` - Export results as CSV
- `GET /api/proxy` - Proxy website content (handles CORS)

## Development

### Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm run dev
```

## Design Principles

- Clean, minimal design
- No excessive shadows or rounded corners
- Generous whitespace
- Flat buttons with clear hover states
- 1px solid borders
- System sans-serif fonts

## Browser Support

- Chrome, Firefox, Safari (latest versions)
- Keyboard shortcuts work on all platforms

## Notes

- Some websites may block iframe embedding despite the proxy
- In those cases, use the "Open in new tab" button
- Sessions are stored in JSON files for simplicity
- Preloading ensures smooth navigation between websites

## License

MIT
