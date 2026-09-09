# MedLab Analytics (Medical Automated Data Analysis System)

An automated medical laboratory decision-support application built with a **Django REST Framework** backend and a responsive **JavaScript/HTML/CSS** frontend.

## 🚀 Live Cloud Deployment
- **Cloud Backend API**: `https://medical-backend-6mi7.onrender.com`
- **Frontend Hosting**: Ready for Netlify deployment (see [DEPLOY_NETLIFY.md](file:///c:/Users/kings/Desktop/degree-project/medical/DEPLOY_NETLIFY.md))

## Features
- **Dashboard**: Real-time metrics on registered patients, tests, results, and abnormal flags.
- **Patient Management**: Registration and records for laboratory patients.
- **Laboratory Tests**: Configurable test catalog with custom reference intervals (lower/upper limits).
- **Results Entry & Analysis**: Automated flagging of results (`WITHIN RANGE`, `HIGH`, `LOW`).
- **Reports & History**: Audit trails and downloadable/printable laboratory reports.
- **Resilience Engine**: Built-in backend health monitor, cold-start warmer, and 1-click fallback switch for defense reliability.

## Project Structure
- `backend/`: Django REST Framework API with token authentication, health endpoints, and SQLite/PostgreSQL support.
- `frontend/`: Single-page web interface with dynamic backend URL discovery and keep-alive pingers.
- `.github/workflows/keep_alive.yml`: Automated GitHub Action to keep the Render free tier service awake 24/7.
- `DEPLOY_NETLIFY.md`: Complete guide for Netlify hosting and defense preparation.

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
- **Backend API URL**: `https://medical-backend-6mi7.onrender.com` (or `http://127.0.0.1:8000` for local)
- **Username:** `labadmin`
- **Password:** `demo123`
