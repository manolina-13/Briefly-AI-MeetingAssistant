# Briefly - AI Meeting Assistant

Briefly is a full-stack browser extension designed to record, transcribe, and summarize meetings from platforms like Google Meet, Microsoft Teams, YouTube, and other web-based meeting platforms. 

**Transform meeting chaos into actionable intelligence in seconds.**

---

## Key Value Propositions

- **Zero Friction**: Records directly in the browser side panel—no separate app or bot needed.
- **Multilingual Output**: Get summaries, action items, and decisions in English, Bengali, or Hindi.
- **AI-Powered Insights**: Powered by Google Gemini for accurate transcription and intelligent multimodal analysis.
- **Actionable Output**: Auto-extracted action items, key decisions, and professional task generation.
- **Architecture Diagrams**: Automatic Mermaid.js flowchart generation for technical discussions.
- **Full History**: Persistent meeting records with global search and cross-meeting chat using local RAG.
- **Enterprise Ready**: 3-layer error resilience, primary/fallback AI models, and robust privacy management.

---

## Core Features

### 1. Meeting Recording & Capture
- Captures high-quality audio directly from browser tabs using Chrome's tabCapture API.
- **Optimized Performance**: Captures only audio tracks to ensure fast uploads and low processing latency.
- Non-intrusive: No bots join your call; it lives entirely in your side panel.

### 2. AI-Powered Analysis
- **Intelligent Summarization**: Generates 3-5 sentence executive overviews.
- **Task Extraction**: Automatically identifies action items with assignees.
- **Decision Logging**: Captures key conclusions and consensus reached during the call.
- **Calendar Integration**: Detects deadlines and meetings, allowing one-click Google Calendar event creation.

### 3. Engineering Workflows (The "Wow" Factor)
- **Auto-Architecture**: Generates visual Mermaid.js flowcharts from spoken technical descriptions.
- **Jira Integration**: Converts any action item into a professional Jira ticket (Title, Description, Acceptance Criteria) with one click.

### 4. Intelligent Context (Local RAG)
- **Meeting Chat**: Ask questions about the specific meeting you just recorded.
- **Global Chat**: Search and query across ALL past meetings stored in your history.

### 5. Multilingual Support
- Full support for English, Bengali (বাংলা), and Hindi (हिन्दी).
- AI translates summaries, tasks, and decisions into your selected language on the fly.

---

## System Architecture

Briefly follows a robust client-server architecture:

1.  **Frontend (Chrome Extension)**:
    - Built with Manifest V3.
    - Premium Dark UI in chrome.sidePanel.
    - Handles audio capture (Web Audio API) and local storage (chrome.storage.local).
2.  **Backend (Python API)**:
    - High-performance FastAPI service.
    - Handles file uploads and orchestrates AI requests.
3.  **AI Intelligence Layer**:
    - **Google Gemini 1.5 Flash**: Primary model for high-speed multimodal analysis.
    - **Google Gemini 1.5 Pro**: Secondary fallback model for complex analysis.

---

## Enterprise-Grade Fault Tolerance

Our backend is designed to never fail silently using a 3-Layer Safety Net:

1.  **Layer 1: Auto-Retry (Shield)**: Automatically catches 429 (Rate Limit) and 503 (Server Overloaded) errors with exponential backoff.
2.  **Layer 2: Async Polling (Patience)**: Safely polls Gemini's processing state before executing prompts, ensuring the AI has "heard" the full audio.
3.  **Layer 3: Strict Janitor (Trust)**: Guaranteed finally blocks instantly purge .webm artifacts from both the local server and Google Cloud to protect user privacy.

---

## Tech Stack

- **Frontend**: HTML5, CSS3 (Custom Variables), Vanilla JavaScript (ES6+), Chrome Extension API (MV3).
- **Backend**: Python 3.8+, FastAPI, Uvicorn, Pydantic, python-multipart.
- **AI/ML**: Google Gemini SDK (google-genai), Mermaid.js (via Mermaid Ink).

---

## Installation & Setup

### Prerequisites
- Python 3.8+
- Chrome/Chromium Browser
- Google Gemini API Key (Get one here: https://aistudio.google.com)

### 1. Backend Setup
```bash
# Navigate to API directory
cd briefly-api

# Create and activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file and add your key
echo "GEMINI_API_KEY=your_key_here" > .env

# Run the server
uvicorn main:app --reload
```

### 2. Extension Setup
1. Open Chrome and go to chrome://extensions/.
2. Enable Developer mode (top-right toggle).
3. Click Load unpacked.
4. Select the briefly-ext folder.
5. Click the Briefly icon in your toolbar to open the Side Panel.

---

## Usage Guide
1. Select your desired output language.
2. Click Start AI Recording and select the tab with your meeting.
3. When finished, click Summarize.
4. Explore your summary, tasks, and diagrams.
5. Use the History tab to search through past meetings.

---

## Contact

- **GitHub**: [manolina-13](https://github.com/manolina-13)
- **Email**: [manolinadas2004@gmail.com](mailto:manolinadas2004@gmail.com)

---

## License

Built by Team Bearly Asleep for Innovatex '26. 

GitHub Repository: [https://github.com/manolina-13/Briefly-AI-MeetingAssistant.git](https://github.com/manolina-13/Briefly-AI-MeetingAssistant.git)