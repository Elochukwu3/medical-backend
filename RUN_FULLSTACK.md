# Run the connected full-stack application

## 1. Backend
Open a terminal:
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```
Keep this terminal running.

Backend: http://127.0.0.1:8000/

## 2. Frontend
Open `frontend/index.html` in your browser.

Login:
- Username: labadmin
- Password: demo123

The frontend calls the Django REST API. Patient/test/result data are no longer stored in browser localStorage.

## Important
This is an academic decision-support application. Automated flags are not medical diagnoses.
