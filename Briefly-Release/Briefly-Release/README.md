# Briefly - Meeting Muse 🎙️

Briefly (also known as Meeting Muse) is a full-stack browser extension designed to record, transcribe, and summarize meetings from platforms like Google Meet, Microsoft Teams, YouTube, and other web-based meeting platforms. It provides a seamless user experience with a premium interface directly within a Chrome side panel, powered by a robust Python backend and advanced generative AI.

**Transform meeting chaos into actionable intelligence in seconds.**

---

## 🎯 Key Value Propositions

- ⚡ **Zero Friction**: Records directly in the browser side panel—no separate app needed
- 🌍 **Multilingual Output**: Get summaries, action items, and decisions in English, Bengali, or Hindi
- 🤖 **AI-Powered Insights**: Powered by Google Gemini for accurate transcription and intelligent analysis
- 📊 **Actionable Output**: Auto-extracted action items, key decisions, and task generation
- 🏗️ **Architecture Diagrams**: Automatic Mermaid flowchart generation for technical discussions
- 💾 **Full History**: Persistent meeting records with global search and cross-meeting chat
- 🔄 **Enterprise Ready**: Fallback models, error resilience, and robust state management

---

## 🚀 Core Features

### 1. **Meeting Recording & Capture**
- Captures audio from any web-based meeting platform (Google Meet, Teams, Zoom web, YouTube)
- Uses Chrome's `chrome.tabCapture` API for reliable, non-intrusive audio capture
- Pause/Resume controls during recording
- Automatic stream cleanup on stop

### 2. **AI-Powered Transcription & Summarization**
- Real-time audio-to-text transcription using Google Gemini models
- Intelligent meeting summarization (3-5 sentence overview)
- Extracts key information automatically:
  - **Action Items**: Automatically identified tasks with assignees
  - **Key Decisions**: Important decisions made during the meeting
  - **Calendar Events**: Deadlines and upcoming events mentioned
  - **Transcript**: Full word-for-word transcript with timestamps

### 3. **Multilingual Support**
- Output language selection (English, Bengali, Hindi)
- Automatically translates:
  - Summary to selected language
  - Action items to selected language
  - Key decisions to selected language
  - Transcript remains in original spoken language
- Full Unicode support for Bengali (বাংলা) and Hindi (हिन्दी) scripts

### 4. **Architecture & Flow Diagram Generation**
- Automatic Mermaid.js flowchart generation for technical processes
- Detects system architecture and workflow descriptions
- Always renders in English for reliability and clarity
- Shows "Diagram is not needed here" if no architecture is discussed
- Copy-to-clipboard button for generated Mermaid code

### 5. **Intelligent Task Management**
- **Create Task Button**: One-click task generation for each action item
- **Language-Aware Task Details**: Generated tasks (title, description, acceptance criteria) are rendered in the selected output language
- **Copy Task Functionality**: Export task details to clipboard for Jira/project management
- Immediate feedback with "Copied!" confirmation

### 6. **Meeting History & Persistence**
- Automatic storage of all meeting records in Chrome storage
- Historical browsing with date/time sorting
- Quick access to past meeting summaries
- Delete individual meetings or clear all history
- Persistent search across meeting transcripts

### 7. **Global Chat & Search**
- **Per-Meeting Chat**: Ask questions about the current meeting
- **Global Chat**: Search and ask questions across ALL past meetings
- Context-aware responses using Gemini AI
- Seamless multi-turn conversation support

### 8. **Export & Integration**
- **Download as TXT**: Export complete meeting notes as plain text
- **Copy for Notion**: Export formatted markdown for Notion integration
- Includes all sections: Summary, Action Items, Key Decisions, Architecture Diagram
- One-click clipboard copy with success confirmation

### 9. **Premium User Interface**
- Dark mode with premium gradient accents (Cyan-to-Blue theme)
- Responsive design with consistent component styling
- Custom SVG icons for all actions
- Accessibility-focused layout with proper contrast and spacing
- Status pills showing recording, processing, and completion states
- Modal-based task viewing with professional formatting

### 10. **Error Handling & Resilience**
- Smart fallback to secondary AI model (Gemini 2.5-Flash) on primary failure
- Exponential backoff for rate limit handling
- Graceful error messages with retry capability
- Session persistence across extension reloads

---

## 💻 Complete Tech Stack

### **Frontend (Browser Extension)**

#### Core Technologies
- **HTML5 & CSS3**: Semantic structure with custom CSS variables for theming
- **Vanilla JavaScript (ES6+)**: 
  - DOM manipulation and event handling
  - Chrome Extension APIs integration
  - Audio stream management
  - Local storage operations
  - Fetch API for HTTP requests

#### Chrome Extension APIs (Manifest V3)
- `chrome.sidePanel`: Main UI container
- `chrome.tabCapture`: Audio capture from browser tabs
- `chrome.storage.local`: Persistent data storage
- `chrome.runtime`: Message passing with background worker
- `chrome.offscreen`: Offscreen document for audio processing

#### Web APIs
- **Media Recording API**: `MediaRecorder` for audio blob creation
- **Blob & FormData APIs**: Audio file handling and multipart uploads
- **Clipboard API**: Copy-to-clipboard functionality
- **Fetch API**: RESTful API communication

#### UI/UX Features
- Gradient color system: `#38bdf8` (Cyan) to `#0284c7` (Blue)
- Dark theme variables for all components
- Responsive grid layouts
- Status indicator pills with animations
- Modal dialogs for task viewing

### **Backend (REST API)**

#### Core Framework
- **FastAPI**: Async Python web framework
  - Auto-generated OpenAPI documentation at `/docs`
  - Request/response validation with Pydantic
  - CORS middleware for cross-origin requests
  - JSON serialization with custom encoders
- **Uvicorn**: ASGI web server
  - Auto-reload during development
  - Graceful shutdown handling
- **Python 3.8+**: Core runtime

#### Middleware & Configuration
- **CORS Middleware**: Allows requests from any origin
- **Environment Variables**: API key management via `.env`
- **Error Handling**: Comprehensive exception handling with user-friendly messages
- **Logging**: Structured logging for debugging and monitoring

#### Dependencies
- `python-multipart`: Handling file uploads (`.webm`)
- `google-genai`: Google Gemini SDK
- `pydantic`: Data validation and settings
- `python-dotenv`: Environment variable loading
- `fastapi`: Core framework
- `uvicorn`: Web server

### **AI & Machine Learning**

#### Google Gemini Integration
- **Models**:
  - Primary: `gemini-3.1-flash-lite-preview` (Fast, cost-effective)
  - Fallback: `gemini-2.5-flash` (Backup for rate limits)
- **Capabilities**:
  - Video/Audio processing with multimodal understanding
  - Long-context analysis (up to 2M tokens)
  - JSON schema constrained output
  - Multilingual support
- **Features**:
  - Automatic file upload to Gemini storage
  - Retry mechanism with exponential backoff
  - Rate limit handling (HTTP 429, 503)
  - File cleanup after processing

#### AI Processing Pipeline
1. **Audio Upload**: WebM file uploaded to Gemini storage
2. **Content Analysis**: Gemini analyzes audio with language-specific prompt
3. **JSON Generation**: Structured output with 6 keys
4. **Extraction**: Summary, action items, decisions, diagram, calendar events, transcript
5. **Language Localization**: All text fields localized to selected language
6. **Diagram Generation**: Mermaid.js flowchart in English (always)

### **API Endpoints**

| Endpoint | Method | Purpose | Input | Output |
|----------|--------|---------|-------|--------|
| `/process-audio` | POST | Record meeting → transcribe → summarize | WebM audio + language | Summary, action items, decisions, diagram, events, transcript |
| `/generate-ticket` | POST | Create task details from action item | Action item + transcript + language | Jira-formatted ticket (title, description, acceptance criteria) |
| `/chat` | POST | Ask question about current meeting | Transcript + question | AI response |
| `/chat-global` | POST | Search across all meetings | Meeting history + question | Cross-meeting AI response |
| `/docs` | GET | OpenAPI documentation | - | Interactive Swagger UI |

### **Data Models**

#### Meeting Record (Stored)
```json
{
  "timestamp": "ISO 8601",
  "language": "English | Bengali | Hindi",
  "summary": "string",
  "action_items": ["string"],
  "decisions": ["string"],
  "transcript": "string",
  "mermaid_diagram": "string",
  "calendar_events": [
    {
      "title": "string",
      "start_time_iso": "ISO 8601",
      "end_time_iso": "ISO 8601",
      "description": "string"
    }
  ]
}
```

#### Generated Ticket
```json
{
  "title": "string (in selected language)",
  "description": "string (in selected language)",
  "acceptance_criteria": ["string (in selected language)"]
}
```

---

## 📁 Project Structure

```
Briefly-Release/
├── README.md                     # This file
├── briefly-api/                  # Python backend
│   ├── main.py                  # FastAPI application
│   ├── requirements.txt          # Python dependencies
│   └── .env.example             # Environment variable template
└── briefly-ext/                  # Chrome extension
    ├── manifest.json            # Extension manifest (V3)
    ├── sidepanel.html           # Main UI
    ├── sidepanel.js             # UI logic & extension API
    ├── background.js            # Service worker
    └── icons/                   # Extension icons (various sizes)
```

---

## 🔧 Installation & Setup

### Prerequisites
- Python 3.8+
- Chrome/Chromium browser
- Google Gemini API key ([get one here](https://aistudio.google.com))

### Backend Setup

1. **Clone and navigate**:
   ```bash
   cd Briefly-Release/Briefly-Release/briefly-api
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

4. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env and add your Google Gemini API key
   export GEMINI_API_KEY="your-key-here"
   ```

5. **Run the server**:
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://127.0.0.1:8000`

### Extension Setup

1. **Navigate to extensions**:
   - Open Chrome and go to `chrome://extensions`
   - Enable **Developer mode** (toggle in top-right)

2. **Load unpacked extension**:
   - Click **Load unpacked**
   - Select `Briefly-Release/Briefly-Release/briefly-ext`

3. **Verify installation**:
   - Extension icon should appear in toolbar
   - Click to open side panel
   - Ensure backend is running (`http://127.0.0.1:8000` should be accessible)

---

## 🎮 Usage Guide

### Recording a Meeting

1. **Open meeting**: Start/join a video call on Google Meet, Teams, YouTube, etc.
2. **Click Briefly icon**: Opens the side panel
3. **Select language**: Choose output language (English, Bengali, Hindi)
4. **Click "Start AI Recording"**: Browser will ask for screen/tab permission
5. **Select tab audio**: Choose the tab with meeting audio
6. **Wait for processing**: Status shows "Recording" → "Analyzing" → "Complete"

### Viewing Results

- **Summary**: High-level meeting overview (3-5 sentences)
- **Action Items**: Tasks with one-click task creation
- **Key Decisions**: Important decisions captured
- **Diagram**: Architecture/workflow if applicable
- **Chat**: Ask questions about the meeting

### Creating Tasks

- Click **"Create Task"** next to any action item
- Ticket details appear in modal (localized to selected language)
- Click **"Copy Task"** to copy to clipboard
- Paste into Jira, Asana, Notion, etc.

### Searching Meetings

- Click **"History"** button in top-right
- View past meetings with preview text
- Use **Global Chat** to search across all meetings
- Delete individual meetings or clear all history

---

## 🔐 Environment Variables

Create a `.env` file in `briefly-api/`:

```env
GEMINI_API_KEY=your-google-gemini-api-key-here
GOOGLE_API_KEY=your-alternative-key-here  # Optional fallback
```

Both keys are supported; the system will use `GOOGLE_API_KEY` if both are set.

---

## 📊 Performance & Constraints

- **Audio Processing**: Handles meetings up to 2 hours
- **API Limits**: Gracefully handles rate limiting with fallback models
- **Storage**: Chrome storage limit ~10MB per extension
- **Response Time**: Typically 30-60 seconds for meeting analysis
- **Supported Formats**: WebM (captured from browser tabs)

---

## 🚀 Future Enhancements

- Cloud sync for meeting records
- Multi-user enterprise features
- CRM integrations (Salesforce, HubSpot)
- Slack/Teams notifications
- Custom prompt templates
- Meeting analytics dashboard
- Real-time subtitles
- Speaker identification

---

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional language support
- Custom AI model fine-tuning
- Performance optimization
- UI/UX enhancements
- Additional integration points

---

## 📝 License

This project is part of a hackathon submission. All rights reserved.

---

## 🙋 Support & Contact

For issues, feature requests, or questions:
- Check the logs in browser DevTools (F12)
- Ensure backend is running (`http://127.0.0.1:8000`)
- Verify Gemini API key is set correctly
- Check Chrome extension permissions

---

## 📚 Topics to Study for the Hackathon Pitch

To confidently present and defend this project at the hackathon, focus on understanding these key areas:

### 1. Chrome Extension Architecture (Manifest V3)
* Understand the role of Service Workers (`background.js`) vs. the UI scripts (`sidepanel.js`).
* Be prepared to explain how `chrome.tabCapture` works and why it's better than `desktopCapture` for this specific use case (avoids system muting, isolates tab audio).
* Understand how `chrome.storage.local` is used to maintain state across the extension.

### 2. Generative AI & API Resilience
* **Gemini Capabilities**: Be able to talk about why Gemini 1.5 Flash/Pro is suited for long-context tasks like meeting summarization.
* **Error Handling**: Be ready to explain your **exponential backoff** and **multi-model fallback** strategies. Judges love to see robust error handling for API rate limits (e.g., smoothly downgrading or retrying when hitting quotas).

### 3. Audio Processing (Web Audio API)
* Understand the basics of `AudioContext`. Explain how the extension captures the audio stream, processes it, and sends it to the backend without interrupting the user's meeting experience.

### 4. FastAPI Backend
* Explain why FastAPI was chosen (speed, async capabilities, auto-generated documentation).
* Be familiar with how the backend handles `multipart/form-data` for receiving audio files from the extension.

### 5. Pitching Strategy (The "Why")
* **The Problem**: Meeting fatigue, lost information, difficulty tracking action items.
* **The Solution**: Briefly works *in the background* and lives right in the browser, reducing friction.
* **Future Scope**: What would you add next? (e.g., cloud sync, multi-user enterprise features, CRM integrations).
