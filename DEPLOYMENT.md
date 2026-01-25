# Deployment Guide

This guide explains how to deploy the House Rental Platform:
- **Backend** (Node.js/Express) -> **Render**
- **Frontend** (Next.js) -> **Vercel**

## Prerequisites
- A GitHub account with this repository pushed to it.
- A [Render](https://render.com) account.
- A [Vercel](https://vercel.com) account.
- A MongoDB Atlas connection string (e.g., `mongodb+srv://...`).

---

## Part 1: Deploy Backend to Render

1.  Log in to your **Render** dashboard.
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the service:
    - **Name**: `house-rent-backend` (or similar)
    - **Region**: Choose the one closest to you (e.g., Singapore, Frankfurt).
    - **Branch**: `main` (or your working branch).
    - **Root Directory**: `backend` (IMPORTANT)
    - **Runtime**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `node server.js`
    - **Plan**: Free
5.  Scroll down to **Environment Variables** and add the following:
    - `NODE_ENV`: `production`
    - `MONGODB_URI`: *Your MongoDB Atlas connection string*
    - `JWT_SECRET`: *A long random secret string*
    - `FRONTEND_URL`: *Leave this blank for now, we will update it after deploying the frontend.*
6.  Click **Create Web Service**.
7.  Wait for the deployment to finish. Once valid, copy the **onrender.com URL** (e.g., `https://house-rent-backend.onrender.com`).

---

## Part 2: Deploy Frontend to Vercel

1.  Log in to your **Vercel** dashboard.
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  Configure the project:
    - **Framework Preset**: Next.js (should be auto-detected).
    - **Root Directory**: Click `Edit` and select `frontend`.
5.  Expand **Environment Variables** and add:
    - `NEXT_PUBLIC_API_URL`: `https://YOUR-BACKEND-URL.onrender.com/api` (Paste the Render URL + `/api`)
    - `NEXT_PUBLIC_SOCKET_URL`: `https://YOUR-BACKEND-URL.onrender.com` (Paste the Render URL)
6.  Click **Deploy**.
7.  Wait for the build to complete. Once done, copy the **vercel.app URL** (e.g., `https://house-rent-frontend.vercel.app`).

---

## Part 3: Final Integration

1.  Go back to your **Render** dashboard.
2.  Select your `house-rent-backend` service.
3.  Go to **Environment**.
4.  Add/Update the `FRONTEND_URL` variable:
    - `FRONTEND_URL`: `https://house-rent-frontend.vercel.app` (Your Vercel URL, no trailing slash).
5.  Click **Save Changes**. Render will automatically restart the server.

## Done! 🚀
Your application should now be fully connected and live.
