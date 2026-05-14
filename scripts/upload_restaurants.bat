@echo off
REM =====================================================
REM  InsideKoreaNow — Supabase Restaurant Upload
REM  1. 이 파일을 프로젝트 루트에 있는 restaurants_travel_db.json 과 같은 폴더에 두거나
REM     아래 JSON_FILE 경로를 수정하세요
REM  2. 더블클릭 또는 cmd에서 실행
REM =====================================================

set SUPABASE_URL=https://qksqschzyqtczbhtuxto.supabase.com
set SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrc3FzY2h6eXF0Y3piaHR1eHRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODczMTQ2MSwiZXhwIjoyMDk0MzA3NDYxfQ.ztluhPc1bDUMHqxXRJQe65ChLdzt9OuOR1Kgu1QJnkk

REM JSON 파일 경로 (프로젝트 루트에 있으면 파일명만, 다른 곳이면 전체 경로)
set JSON_FILE=restaurants_travel_db.json

echo ================================================
echo  Supabase 맛집 DB 업로드 시작
echo  URL: %SUPABASE_URL%
echo ================================================
echo.

pip install supabase --quiet

python scripts\upload_restaurants.py %JSON_FILE%

echo.
echo ================================================
echo  완료! 아무 키나 누르면 창이 닫힙니다.
echo ================================================
pause
