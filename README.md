# Uthao — FastAPI scaffold

This branch adds a FastAPI backend scaffold, templates, static assets, and SQLite persistence to the Uthao frontend.

Quick start (development):

1. python -m venv .venv
2. source .venv/bin/activate
3. pip install -r requirements.txt
4. uvicorn main:app --reload

Open http://127.0.0.1:8000/

Notes:
- Replace the SECRET_KEY in auth.py with an env var for production.
- Consider Postgres for production; set DATABASE_URL accordingly.
