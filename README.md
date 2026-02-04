# Developer Toolkit

A modern, full-stack developer utility suite built with Next.js 14, Spring Boot 3, and Google Gemini AI integration.

## Features

- **Dashboard**: Real-time ecosystem stats, web developer growth charts, and latest tech news.
- **Utilities**:
  - **JSON Converter**: AI-powered tool to convert random unstructured text into clean JSON.
  - **Regex Tester**: Live matching with index and group tracking.
  - **Markdown Preview**: Real-time rendering with full styling.
  - **Base64 Converter**: Encode and decode text with one-click copy.
  - **API Tester**: Powerful HTTP request builder and response viewer.
  - **Snippet Manager**: Save, copy, and manage code snippets with MySQL persistence.
- **AI Tools** (Powered by Google Gemini 2.5 Flash):
  - **AI Summarizer**: Condense long text into concise summaries.
  - **Resume Analyzer**: Get AI scores and improvement suggestions for your career.
  - **AI Chat Assistant**: A smart coding companion for your daily tasks.

## Tech Stack

**Frontend**:
- Next.js 14 (App Router)
- TypeScript & TailwindCSS
- Shadcn/UI & Framer Motion (Animations)
- Axios & Recharts (Data Visualization)

**Backend**:
- Java 17+
- Spring Boot 3
- Spring Data JPA & MySQL
- WebClient (Reactive API calls)
- Google Gemini API

## Prerequisites

- Node.js 18+
- Java 17+ (JDK)
- MySQL Database
- Google Gemini API Key

## Getting Started

### 1. Database Setup
Create a database named `devtools` in your MySQL instance.

### 2. Backend Setup
1. Navigate to `backend/`.
2. Update `src/main/resources/application.properties` with your MySQL credentials and Gemini API Key.
3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```
   The backend starts on `http://localhost:8080`.

### 3. Frontend Setup
1. Navigate to `frontend/`.
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`
4. Open `http://localhost:3000`.

## Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to Docker, Render, and Vercel.
