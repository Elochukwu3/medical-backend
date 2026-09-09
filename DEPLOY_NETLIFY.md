# Hosting on Netlify + Free Backend

This project has two parts:
1. **Frontend (`frontend/`)**: Hosted for free on **Netlify**.
2. **Backend (`backend/`)**: Hosted for free on **Render** (or **PythonAnywhere**).

---

## Step 1: Deploy Frontend on Netlify (Takes 1 Minute)

### Option A: Drag & Drop (Fastest — No Git required)
1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop) and log in.
2. Drag and drop the `frontend` folder (`c:\Users\kings\Desktop\degree-project\medical\frontend`) directly into the Netlify Drop zone.
3. Netlify will instantly give you a live URL (e.g. `https://your-site-name.netlify.app`).

### Option B: Via GitHub
1. Push your repository to GitHub.
2. In Netlify, click **Add new site** > **Import an existing project** > **GitHub**.
3. Select this repo.
4. Set:
   - **Publish directory**: `frontend`
5. Click **Deploy site**.

---

## Step 2: Deploy Backend for Free on Render.com (Takes 3 Minutes)

Since Netlify only hosts static frontend files, your Django API runs on Render for free:

1. Push your project to GitHub.
2. Go to [https://render.com](https://render.com) and sign in.
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Configure the following fields:
   - **Name**: `medlab-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: 
     ```bash
     pip install -r requirements.txt && python manage.py migrate && python manage.py seed_demo
     ```
   - **Start Command**: 
     ```bash
     gunicorn config.wsgi:application
     ```
6. Click **Create Web Service**.
7. Render will provide your public backend URL, for example: `https://medlab-backend.onrender.com`.

---

## Step 3: Connect Frontend to Backend

1. Open your Netlify site (`https://your-site-name.netlify.app`).
2. On the sign-in screen, enter:
   - **Username**: `labadmin`
   - **Password**: `demo123`
   - **Backend API URL**: Paste your Render URL (e.g. `https://medlab-backend.onrender.com`).
3. Click **Sign in**. The URL will be saved automatically for future visits!
