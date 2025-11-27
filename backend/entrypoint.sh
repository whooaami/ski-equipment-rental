#!/bin/bash
set -e

echo "Waiting for postgres..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

echo "Running migrations..."
alembic upgrade head

echo "Seeding database with rent_company@gmail.com data..."
PGPASSWORD=postgres psql -h db -U postgres -d ski_rental -f /app/init_db/01_seed_rent_company.sql || echo "Seed already loaded or failed"

echo "Starting FastAPI..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
