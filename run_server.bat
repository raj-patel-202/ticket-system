@echo off
echo ========================================================
echo   Starting Online Ticketing Platform Server
echo ========================================================

if exist ".venv\Scripts\activate.bat" (
    echo Activating .venv ...
    call .venv\Scripts\activate.bat
) else (
    echo [WARNING] .venv not detected. Using system Python or run setup.bat first!
)

echo Starting FastAPI server at http://127.0.0.1:8000 ...
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause
