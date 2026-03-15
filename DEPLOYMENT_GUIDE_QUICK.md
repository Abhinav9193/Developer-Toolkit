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

### 1. 🐘 Neon DB Setup (Current Project: dawn-forest)
1. Go to your [Neon Console](https://console.neon.tech/app/projects/dawn-forest-07064942).
2. Copy the **JDBC** connection string.
3. It should start with `jdbc:postgresql://`.

### ⚙️ Render Environment Variables (COPY THESE EXACTLY)
| Key | Value |
| :--- | :--- |
| **SPRING_PROFILES_ACTIVE** | `prod` |
| **PORT** | `8080` |
| **SPRING_DATASOURCE_URL** | `jdbc:postgresql://ep-dawn-forest-07064942.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| **SPRING_DATASOURCE_USERNAME** | `neondb_owner` |
| **SPRING_DATASOURCE_PASSWORD** | `npg_fhy6DMPKZYV7` |
| **GEMINI_API_KEY** | (Your actual Gemini Key) |

### 🚀 Vercel Fix
1. Ensure `NEXT_PUBLIC_API_URL` is set to `https://dev-toolkit-backend.onrender.com`.
2. Click **Redeploy** on the latest deployment.

### 🛠️ Why it was failing:
1. **SCRAM Bug**: The previous driver (42.7.3) had a bug with Neon's authentication iterations. I updated the code to use **42.7.5** which fixes this.
2. **Missing `jdbc:` prefix**: The connection URL must start with `jdbc:postgresql://`.
3. **Hibernate Dialect**: I removed the explicit dialect to let Spring Boot 3 auto-detect the best one, avoiding a common startup crash.
*   Verified CORS configuration in Backend to allow Frontend requests.
*   Confirmed Multi-Environment properties (`local` vs `prod`).
*   Verified that all entities/DTOs are Lombok-free for Java 21 compatibility.

**Your project is now ready for the live link!**
