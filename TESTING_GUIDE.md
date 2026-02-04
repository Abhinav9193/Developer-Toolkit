# Developer Toolkit Testing Guide

This guide provides instructions on how to run automated tests and how to manually verify features using sample data.

## 1. Automated Tests

### Backend
The backend includes JUnit tests for Controllers and Services.

**Run All Tests:**
```bash
cd backend
mvn test
```

### Frontend
The frontend uses Jest and React Testing Library.

**Run All Tests:**
```bash
cd frontend
npm test
```

---

## 2. Manual Testing with Sample Data

Use the following data to verify the application features.

### 2.1 JSON Formatter
**URL:** `/json`

**Sample Input (Unformatted):**
```json
{"name":"DevToolkit","version":1,"features":["json","regex","ai"],"active":true}
```
**Action:** Paste into "Input" -> Click maximize icon (Format).
**Expected Output:** Beautifully indented JSON.

**Sample Input (Invalid):**
```json
{ name: "Error" }
```
**Action:** Paste -> Click Format.
**Expected:** "Invalid JSON" error message.

### 2.2 Regex Tester
**URL:** `/regex`

**Sample Pattern:**
```regex
\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b
```
(Flags: `gm`)

**Sample Text:**
```text
Contact us at support@example.com or sales@test.co.uk anytime.
This is not an email.
admin@localhost is also valid.
```
**Expected:** Emails should be highlighted/listed in the matches panel.

### 2.3 Base64 Converter
**URL:** `/base64`

**Sample Input:** `Hello World`
**Action:** Click "Encode"
**Expected Output:** `SGVsbG8gV29ybGQ=`

**Sample Input:** `SGVsbG8gV29ybGQ=`
**Action:** Click "Decode"
**Expected Output:** `Hello World`

### 2.4 API Tester
**URL:** `/api-tester`

**Method:** `GET`
**URL:** `https://jsonplaceholder.typicode.com/todos/1`
**Action:** Click "Send Request"
**Expected:** JSON response with `userId`, `id`, `title`.

**Method:** `POST`
**URL:** `https://jsonplaceholder.typicode.com/posts`
**Body:**
```json
{
  "title": "foo",
  "body": "bar",
  "userId": 1
}
```
**Expected:** Status 201 Created.

### 2.5 Snippet Manager
**URL:** `/snippets`

**Action:** Create New Snippet
- **Title:** `Binary Search`
- **Language:** `Java`
- **Code:**
```java
int binarySearch(int arr[], int x) {
    int l = 0, r = arr.length - 1;
    while (l <= r) {
        int m = l + (r - l) / 2;
        if (arr[m] == x) return m;
        if (arr[m] < x) l = m + 1;
        else r = m - 1;
    }
    return -1;
}
```
**Expected:** Snippet appears in the list on the left.
**Action:** Refresh Code.
**Expected:** Snippet persists (saved to MySQL).

### 2.6 AI Tools (Requires OPENAI_API_KEY)

#### Summarizer (`/ai/summarize`)
**Input:**
> Java is a high-level, class-based, object-oriented programming language that is designed to have as few implementation dependencies as possible. It is a general-purpose programming language intended to let application developers write once, run anywhere (WORA), meaning that compiled Java code can run on all platforms that support Java without the need for recompilation. Java applications are typically compiled to bytecode that can run on any Java virtual machine (JVM) regardless of the underlying computer architecture.

**Action:** Click Summarize.
**Expected:** A short 1-2 sentence summary.

#### Chat Assistant (`/ai/chat`)
**Input:** `Hello, can you help me write a Spring Boot Controller?`
**Expected:** AI responds with a code example and explanation.

#### Resume Analyzer (`/ai/resume`)
**Input:** Paste a sample resume text.
**Expected:** A score (0-100) and bullet points for improvement.
