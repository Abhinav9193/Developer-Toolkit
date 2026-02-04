# Developer Toolkit

A modern, full-stack developer utility suite built with Next.js 14, Spring Boot 3, and AI integration.

## Features

- **Dashboard**: Usage statistics and charts.
- **Utilities**:
  - JSON Formatter (Format, Minify)
  - Regex Tester (Live matching)
  - Markdown Preview (Real-time)
  - Base64 Converter
  - API Tester (HTTP Requests)
  - Snippet Manager (Save code snippets to database)
- **AI Tools** (Powered by OpenAI GPT-4o-mini):
  - Summarizer
  - Resume Analyzer
  - Chat Assistant

## Tech Stack

**Frontend**:
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Shadcn/UI components
- Framer Motion
- Axios
- Recharts

**Backend**:
- Java 21
- Spring Boot 3
- Spring Data JPA
- MySQL
- WebClient (for OpenAI)

## Prerequisites

- Node.js 18+
- Java 21 (JDK)
- Maven
- MySQL Database
- OpenAI API Key

## Getting Started

### 1. Database Setup

Ensure MySQL is running. Create a database named `devtools`.

```sql
CREATE DATABASE devtools;
```

### 2. Backend Setup

Navigate to `backend/`:

1. Open `src/main/resources/application.yml` and check the database credentials (username: `root`, password: `password`). Update if needed.
2. Set your OpenAI API Key environment variable:

   **Windows (PowerShell)**:
   ```powershell
   $env:OPENAI_API_KEY="sk-..."
   ```

   **Linux/Mac**:
   ```bash
   export OPENAI_API_KEY="sk-..."
   ```

3. Run the application:

   ```bash
   mvn spring-boot:run
   ```

   The backend will start on `http://localhost:8080`.

### 3. Frontend Setup

Navigate to `frontend/`:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser.

## Project Structure

```
developer-toolkit/
├── backend/            # Spring Boot Application
│   ├── src/main/java   # Java Source Code
│   └── pom.xml         # Maven Config
├── frontend/           # Next.js Application
│   ├── src/app         # App Router Pages
│   ├── src/components  # UI Components
│   └── package.json    # Frontend Config
└── README.md
```
