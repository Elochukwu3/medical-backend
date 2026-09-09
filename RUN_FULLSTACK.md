# Run the Connected Full-Stack Application

## 1. Backend Options

### Option A: Use Live Cloud Backend (Default)
The live cloud API is already running at:
`https://medical-backend-6mi7.onrender.com`

### Option B: Run Local Django Backend
If you want to run offline or locally:
```bash
cd backend
.venv\Scripts\activate
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```
Backend will run at: `http://127.0.0.1:8000/`

---

## 2. Frontend
Open `frontend/index.html` directly in your browser or deploy to Netlify.

### Login Credentials:
- **Backend API URL**: `https://medical-backend-6mi7.onrender.com` (or toggle `💻 Local Django`)
- **Username**: `labadmin`
- **Password**: `demo123`

---

## 3. Defense Day Reliability Tip
To keep the free Render backend awake 24/7, set up a free 5-minute monitor on [UptimeRobot.com](https://uptimerobot.com) targeting `https://medical-backend-6mi7.onrender.com/health/` (see [DEPLOY_NETLIFY.md](file:///c:/Users/kings/Desktop/degree-project/medical/DEPLOY_NETLIFY.md) for details).
