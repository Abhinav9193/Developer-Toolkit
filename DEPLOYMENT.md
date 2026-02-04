# Deployment Guide: Developer Toolkit

This guide provides a step-by-step approach to deploying the Full-Stack Developer Toolkit.

---

## 1. Database Deployment (MySQL)
The simplest way to deploy a MySQL database is using a managed service like **Aiven**, **Railway**, or **Clever Cloud**.

1.  **Create a MySQL instance**: Sign up for [Aiven.io](https://aiven.io/) or [Railway.app](https://railway.app/).
2.  **Get Credentials**: Once the database is ready, note down the following:
    *   **Host**: (e.g., `mysql-instance.aivencloud.com`)
    *   **Port**: (usually `3306`)
    *   **User**: (e.g., `admin`)
    *   **Password**: Your secret password
    *   **Database Name**: `devtoolkit` (or similar)
3.  **Construct JDBC URL**: `jdbc:mysql://<HOST>:<PORT>/<DB_NAME>?useSSL=true`

---

## 2. Backend Deployment (Spring Boot)
Recommended platform: **Render**, **Railway**, or **AWS Elastic Beanstalk**.

### Steps for Render:
1.  **Create a New Web Service**: Connect your GitHub repository.
2.  **Runtime**: Select `Docker` (highly recommended) or `Java`.
    *   If selecting `Docker`, Render will automatically use the `backend/Dockerfile`.
3.  **Environment Variables**: Add these key variables in the dashboard:
    *   `SPRING_DATASOURCE_URL`: The JDBC URL from step 1.
    *   `SPRING_DATASOURCE_USERNAME`: Your DB user.
    *   `SPRING_DATASOURCE_PASSWORD`: Your DB password.
    *   `GEMINI_API_KEY`: Your Google Gemini API key.
4.  **Build Command**: `./mvnw clean package -DskipTests` (inside the `backend` folder).
5.  **Start Command**: `java -jar target/*.jar`.

---

## 3. Frontend Deployment (Next.js)
Recommended platform: **Vercel** (the creators of Next.js).

### Steps for Vercel:
1.  **Import Project**: Go to [Vercel](https://vercel.com/) and import your GitHub repo.
2.  **Framework Preset**: Select `Next.js`.
3.  **Root Directory**: Set this to `frontend`.
4.  **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: The URL of your deployed backend (e.g., `https://your-backend.onrender.com`).
5.  **Deploy**: Click "Deploy". Vercel will automatically handle the build and provide a production URL.

---

## 4. Final Verification
1.  **CORS**: Ensure the backend allows the Vercel frontend URL in `AIController` or a global configuration.
2.  **API URL**: Update individual frontend pages if they have hardcoded `localhost:8080`.
    *   *Tip: Use an environment variable like `process.env.NEXT_PUBLIC_API_URL` in the frontend code.*

---

## Security Checklist
*   [x] Added `application.properties` to `.gitignore`.
*   [ ] Use Environment Variables for ALL secrets (DB password, API keys).
*   [ ] Enable HTTPS (handled automatically by Vercel and Render).
