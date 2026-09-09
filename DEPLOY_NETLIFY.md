# Hosting on Netlify + Render Backend (Defense-Ready)

This project is configured with:
1. **Frontend (`frontend/`)**: Hosted for free on **Netlify**.
2. **Backend (`backend/`)**: Live on **Render** at `https://medical-backend-6mi7.onrender.com`.

---

## 🛡️ Critical: Preventing Render Free Tier "Sleep" on Defense Day

### Why does Render go off?
On the **Render Free Tier**, web services automatically **spin down into sleep mode after 15 minutes of inactivity**. When a new visitor opens the site, Render takes **30 to 50 seconds ("cold start")** to wake up.

To avoid delays or awkward waiting in front of project supervisors and examiners, use one of the guaranteed solutions below:

---

### Solution 1: Free 24/7 Automated Pinger via UptimeRobot (100% Free & Recommended)
This pings your Render backend every 5 minutes so it **never goes to sleep**.

1. Go to [https://uptimerobot.com](https://uptimerobot.com) and create a free account.
2. Click **+ Add New Monitor**.
3. Fill in the details:
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `MedLab Render Keep-Alive`
   - **URL (or IP)**: `https://medical-backend-6mi7.onrender.com/health/`
   - **Monitoring Interval**: `Every 5 minutes`
4. Click **Create Monitor**.
5. **Result**: UptimeRobot will ping your server automatically every 5 minutes 24/7, keeping your backend hot, fast, and 100% awake!

---

### Solution 2: Automated GitHub Actions Keep-Alive (Built-in)
A GitHub Actions workflow is already configured at `.github/workflows/keep_alive.yml`.
When you push this repository to GitHub, GitHub Actions will automatically ping your Render backend every 10 minutes on a cron schedule.

---

### Solution 3: Defense Day Protocol (15 Minutes Before Presentation)
1. **15 minutes before your turn:** Open your phone or laptop browser and visit:
   `https://medical-backend-6mi7.onrender.com/health/`
2. This warms up the Render container so it responds in **sub-second speed** during your presentation.

---

### Solution 4: Emergency Offline Fallback (Bulletproof Plan B)
If the defense hall has terrible Wi-Fi or Render experiences cloud downtime:
1. Open terminal on your presentation laptop:
   ```bash
   cd backend
   .venv\Scripts\activate
   python manage.py runserver
   ```
2. On the frontend login screen, click the **`💻 Local Django`** button (or set backend to `http://127.0.0.1:8000`).
3. Sign in immediately with `labadmin` / `demo123`.

---

## Deploying Frontend on Netlify

### Option A: Drag & Drop
1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop) and log in.
2. Drag and drop the `frontend` folder (`c:\Users\kings\Desktop\degree-project\medical\frontend`) directly into the Netlify Drop zone.
3. Netlify will give you a live URL (e.g. `https://your-medlab.netlify.app`).

### Option B: Via GitHub
1. Push your repo to GitHub.
2. In Netlify, click **Add new site** > **Import an existing project** > **GitHub**.
3. Select this repo and set:
   - **Publish directory**: `frontend`
4. Click **Deploy site**.

---

## Login Credentials
- **Backend API URL**: `https://medical-backend-6mi7.onrender.com` (configured by default)
- **Username**: `labadmin`
- **Password**: `demo123`
