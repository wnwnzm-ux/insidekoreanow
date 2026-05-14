@echo off
set SUPABASE_URL=https://qksqschzyqtczbhtuxto.supabase.com
set SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrc3FzY2h6eXF0Y3piaHR1eHRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODczMTQ2MSwiZXhwIjoyMDk0MzA3NDYxfQ.ztluhPc1bDUMHqxXRJQe65ChLdzt9OuOR1Kgu1QJnkk

set SCRIPT=%~dp0upload_restaurants.py
set JSON=%~dp0..\restaurants_travel_db.json

echo Starting upload...
echo Script: %SCRIPT%
echo JSON:   %JSON%
echo.

pip install supabase --quiet
python "%SCRIPT%" "%JSON%"

echo.
echo Done! Press any key to close.
pause
