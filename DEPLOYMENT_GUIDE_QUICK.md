# 🚀 Deployment Guide: Developer Toolkit

Follow these steps to deploy your project to **Neon DB**, **Render**, and **Vercel** in less than 5 minutes.

## 1. 🐘 Database: Neon DB
The project is already configured to use Neon DB in production.

1.  **Create a Neon Account**: Go to [neon.tech](https://neon.tech) and create a new project.
2.  **Get Connection String**: Copy the `DATABASE_URL` or the individual components (Host, User, Password, DB Name).
3.  **Current Config**: Your `application-prod.properties` currently uses:
    *   **Host**: `ep-quiet-violet-ai7dk1gc-pooler.c-4.us-east-1.aws.neon.tech`
    *   **DB**: `neondb`
    *   **User**: `neondb_owner`
    *   **Password**: `npg_fhy6DMPKZYV7` (Update this in Render Environment Variables if it changes).

## 2. ⚙️ Backend: Render
Render will host your Spring Boot API.

1.  **Connect GitHub**: Go to [dashboard.render.com](https://dashboard.render.com), click **New > Web Service**, and connect your repository.
2.  **Configuration**:
    *   **Root Directory**: `backend`
    *   **Runtime**: `Docker` (It will automatically find the `Dockerfile`).
3.  **Environment Variables**:
    *   `SPRING_PROFILES_ACTIVE`: `prod`
    *   `PORT`: `8080`
    *   `GEMINI_API_KEY`: `AIzaSy...` (Your Gemini Key)
    *   `SPRING_DATASOURCE_URL`: (Your Neon Connection String)
    *   `SPRING_DATASOURCE_USERNAME`: (Your Neon User)
    *   `SPRING_DATASOURCE_PASSWORD`: (Your Neon Password)
4.  **Wait for Build**: Render will build the Docker image and deploy. Note your Render URL (e.g., `https://your-app.onrender.com`).

## 3. 🌐 Frontend: Vercel
Vercel is the best home for your Next.js frontend.

1.  **Connect GitHub**: Go to [vercel.com](https://vercel.com), click **Add New > Project**, and import your repository.
2.  **Configuration**:
    *   **Root Directory**: `frontend`
    *   **Framework Preset**: `Next.js`
3.  **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: `https://your-app.onrender.com` (Your Render Backend URL)
4.  **Deploy**: Click **Deploy**. Vercel will have it live in ~1 minute.

---

### ✅ Quick Fixes Made:
*   Added `next.config.js` to allow external images (Picsum).
*   Verified CORS configuration in Backend to allow Frontend requests.
*   Confirmed Multi-Environment properties (`local` vs `prod`).
*   Verified that all entities/DTOs are Lombok-free for Java 21 compatibility.

**Your project is now ready for the live link!**
