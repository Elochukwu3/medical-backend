# MedLab Analytics Backend
Django REST Framework backend for the Medical Automated Data Analysis System.

## Setup
1. Create a virtual environment:
   python -m venv .venv
2. Activate it.
   - Windows PowerShell: .\.venv\Scripts\Activate.ps1
   - Command Prompt: .\.venv\Scripts\activate.bat
   - Git Bash / bash: source .venv/Scripts/activate
3. Install dependencies:
   pip install -r requirements.txt
4. Run migrations:
   python manage.py migrate
5. Create an admin account:
   python manage.py createsuperuser
6. Start:
   python manage.py runserver

API base: /api/
Admin: /admin

This backend is an academic project. It uses rule-based reference-range flagging and is not a medical diagnostic system.
