@echo off
echo Starting ICP Classification Webapp...
echo.

REM Check if backend venv exists
if not exist "backend\venv" (
    echo Creating Python virtual environment...
    cd backend
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
    cd ..
)

REM Check if frontend node_modules exists
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo Starting backend on http://localhost:8000...
cd backend
call venv\Scripts\activate
start /B uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
cd ..

echo Starting frontend on http://localhost:3000...
cd frontend
start /B npm run dev
cd ..

echo.
echo =========================================
echo ICP Classification Webapp is running!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo =========================================
echo.
echo Press Ctrl+C to stop both servers
pause
