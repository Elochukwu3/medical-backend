# MedLab Analytics (Medical Automated Data Analysis System)

An automated medical laboratory decision-support application built with a **Django REST Framework** backend and a responsive **JavaScript/HTML/CSS** frontend.

## Features
- **Dashboard**: Real-time metrics on registered patients, tests, results, and abnormal flags.
- **Patient Management**: Registration and records for laboratory patients.
- **Laboratory Tests**: Configurable test catalog with custom reference intervals (lower/upper limits).
- **Results Entry & Analysis**: Automated flagging of results (`WITHIN RANGE`, `HIGH`, `LOW`).
- **Reports & History**: Audit trails and downloadable/printable laboratory reports.

## Project Structure
- `backend/`: Django REST Framework API with token authentication and SQLite/PostgreSQL support.
- `frontend/`: Single-page web interface with dynamic backend URL discovery.
- `DEPLOY_NETLIFY.md`: Guide to hosting the frontend on Netlify and backend on Render/PythonAnywhere.

## Quick Start (Local)

### 1. Backend
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

### 2. Frontend
Open `frontend/index.html` in your browser.

**Demo Credentials:**
- **Username:** `labadmin`
- **Password:** `demo123`
