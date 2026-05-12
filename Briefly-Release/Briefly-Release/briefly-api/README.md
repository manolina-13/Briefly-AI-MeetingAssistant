# Briefly Backend API 🔧

This is the FastAPI backend for Briefly, handling audio processing, AI analysis, and task generation.

## 📋 Overview

The backend provides RESTful endpoints for:
- Audio transcription and meeting summarization
- Intelligent task generation from action items
- Meeting-specific and cross-meeting chat functionality
- Multilingual support (English, Bengali, Hindi)
- Fallback mechanisms for API resilience

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Google Gemini API key ([get one here](https://aistudio.google.com))

### Installation

1. **Navigate to API directory**:
   ```bash
   cd briefly-api
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Linux/Mac
   # or
   .venv\Scripts\Activate.ps1  # Windows PowerShell
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your-api-key-here
   GOOGLE_API_KEY=your-alternative-key-here  # Optional fallback
   ```

5. **Run the server**:
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://127.0.0.1:8000`

6. **Access documentation**:
   - Swagger UI: `http://127.0.0.1:8000/docs`
   - ReDoc: `http://127.0.0.1:8000/redoc`

---

## 📚 API Endpoints

### 1. `/process-audio` (POST)

Transcribes and analyzes meeting audio.

**Request**:
```bash
curl -X POST "http://127.0.0.1:8000/process-audio" \
  -F "file=@meeting.webm" \
  -F "language=English"
```

**Parameters**:
- `file` (multipart): WebM audio file
- `language` (form): `English` | `Bengali` | `Hindi`

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "summary": "Meeting overview in selected language",
    "action_items": ["Task 1", "Task 2"],
    "decisions": ["Decision 1", "Decision 2"],
    "mermaid_diagram": "graph TD\n A[Node] --> B[Node]",
    "calendar_events": [
      {
        "title": "Deadline",
        "start_time_iso": "2026-05-15T10:00:00",
        "end_time_iso": "2026-05-15T11:00:00",
        "description": "Event description"
      }
    ],
    "transcript": "Full word-for-word transcript"
  }
}
```

**Error Response** (5XX):
```json
{
  "status": "error",
  "message": "The AI is currently overloaded. Please try again in 1 minute."
}
```

---

### 2. `/generate-ticket` (POST)

Creates a detailed task ticket from an action item.

**Request**:
```bash
curl -X POST "http://127.0.0.1:8000/generate-ticket" \
  -H "Content-Type: application/json" \
  -d '{
    "action_item": "Implement authentication module",
    "transcript": "Full meeting transcript",
    "language": "Bengali"
  }'
```

**Parameters** (JSON body):
- `action_item` (string): The action item to convert
- `transcript` (string): Full meeting transcript for context
- `language` (string): `English` | `Bengali` | `Hindi`

**Response** (200 OK):
```json
{
  "status": "success",
  "ticket": {
    "title": "Ticket title in selected language",
    "description": "Detailed description in selected language",
    "acceptance_criteria": [
      "Criterion 1 in selected language",
      "Criterion 2 in selected language"
    ]
  }
}
```

---

### 3. `/chat` (POST)

Asks a question about a specific meeting.

**Request**:
```bash
curl -X POST "http://127.0.0.1:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "Full meeting transcript",
    "question": "What were the main discussion points?"
  }'
```

**Parameters** (JSON body):
- `transcript` (string): Meeting transcript
- `question` (string): User question

**Response** (200 OK):
```json
{
  "status": "success",
  "answer": "Answer to the question based on the transcript"
}
```

---

### 4. `/chat-global` (POST)

Searches and answers questions across all past meetings.

**Request**:
```bash
curl -X POST "http://127.0.0.1:8000/chat-global" \
  -H "Content-Type: application/json" \
  -d '{
    "history": [
      {
        "date": "2026-05-10T10:00:00",
        "transcript": "Meeting 1 transcript"
      },
      {
        "date": "2026-05-09T14:00:00",
        "transcript": "Meeting 2 transcript"
      }
    ],
    "question": "What deadlines were discussed?"
  }'
```

**Parameters** (JSON body):
- `history` (array): Array of past meetings with date and transcript
- `question` (string): User question

**Response** (200 OK):
```json
{
  "status": "success",
  "answer": "Answer citing relevant meetings"
}
```

---

## 🔄 AI Processing Pipeline

### Flow
1. **Audio Upload**: WebM file is uploaded to Google Gemini storage
2. **File Processing**: Waits for Gemini to process the audio file
3. **Prompt Execution**: Sends language-specific analysis prompt to Gemini
4. **Primary Model**: Attempts with `gemini-3.1-flash-lite-preview`
5. **Fallback**: If rate-limited, automatically retries with `gemini-2.5-flash`
6. **JSON Parsing**: Parses structured JSON response
7. **Cleanup**: Deletes temporary files from both local and cloud storage

### Language Processing

#### Input Language Selection
- User selects output language in extension UI
- Sent to backend in `/process-audio` request

#### Output Language Handling
- **Summary**: Generated in selected language
- **Action Items**: All items in selected language
- **Decisions**: All decisions in selected language
- **Transcript**: Remains in original spoken language (untranslated)
- **Mermaid Diagram**: Always in English (for rendering reliability)
- **Calendar Events**: Titles in selected language, dates in ISO 8601

### Supported Languages
- **English**: Standard Latin script
- **Bengali (বাংলা)**: Full Unicode support with proper script rendering
- **Hindi (हिन्दी)**: Devanagari script with proper encoding

---

## 🛠️ Configuration

### Environment Variables

Create `.env` file with:

```env
# API Keys (at least one required)
GEMINI_API_KEY=your-primary-key
GOOGLE_API_KEY=your-alternative-key

# Optional: Backend host/port (defaults to 127.0.0.1:8000)
API_HOST=0.0.0.0
API_PORT=8000
```

**Priority**: If both keys are set, `GOOGLE_API_KEY` is used.

### Requirements.txt

```
fastapi==0.104.1
uvicorn==0.24.0
python-multipart==0.0.6
google-genai==0.3.0
python-dotenv==1.0.0
pydantic==2.5.0
```

---

## 📊 Error Handling

### Rate Limiting
- **Primary Model**: `gemini-3.1-flash-lite-preview`
- **Fallback Model**: `gemini-2.5-flash` (on HTTP 429/503)
- **Backoff Strategy**: Exponential backoff with configurable retries
- **Max Retries**: 3 attempts before returning error

### File Handling
- Automatic cleanup of temp files after processing
- Gemini storage files deleted after use
- WebM format validation (`.webm` suffix)

### Error Messages
- User-friendly error responses
- Detailed logging for debugging
- Graceful fallback mechanisms

### Example Error Handling
```python
try:
    # Primary model attempt
    response = client.models.generate_content(
        model="gemini-3.1-flash-lite-preview",
        contents=[uploaded_file, prompt],
        config=config
    )
except Exception as primary_error:
    # Fallback to secondary model
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[uploaded_file, prompt],
        config=config
    )
```

---

## 🔍 Debugging

### View Logs
```bash
# Server logs show processing status
# Look for lines like:
# - "Uploading to Google Gemini Storage..."
# - "Attempt 1: Analyzing with Primary Model..."
# - "AI Processing Complete!"
```

### Check API Health
```bash
curl http://127.0.0.1:8000/docs
```

### Test Endpoint
```bash
# Using curl
curl -X POST "http://127.0.0.1:8000/process-audio" \
  -F "file=@test.webm" \
  -F "language=English"
```

---

## 🚀 Deployment

### Production Setup

1. **Install with production ASGI**:
   ```bash
   pip install gunicorn
   ```

2. **Run with Gunicorn**:
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
   ```

3. **Set environment**:
   ```bash
   export GEMINI_API_KEY="your-key"
   export API_HOST="0.0.0.0"
   ```

4. **Configure reverse proxy** (Nginx/Apache)
   - Forward to `http://127.0.0.1:8000`
   - Set appropriate timeouts (120+ seconds for audio processing)

### Docker (Optional)

```dockerfile
FROM python:3.9

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY main.py .

ENV GEMINI_API_KEY=${GEMINI_API_KEY}
ENV API_HOST=0.0.0.0

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 📈 Performance Tips

- Audio processing typically takes 30-60 seconds
- Larger meetings (90+ min) may take 2-3 minutes
- WebM format provides good compression
- Batch processing not recommended (process one meeting at a time)

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `API key not found` | Ensure `.env` file exists with `GEMINI_API_KEY` |
| `Connection refused` | Backend server not running—run `uvicorn main:app --reload` |
| `413 Request Entity Too Large` | Audio file too large—check WebM encoding |
| `503 Service Unavailable` | Gemini API rate limited—will auto-retry with fallback |
| `Invalid JSON response` | Gemini response malformed—check API availability |

---

## 📝 License

Part of the Briefly hackathon project. All rights reserved.
