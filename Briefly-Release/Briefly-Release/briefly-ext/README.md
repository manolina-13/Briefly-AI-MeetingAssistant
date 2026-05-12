# Briefly Chrome Extension 🎙️

This is the frontend Chrome extension for Briefly, providing the user interface and meeting recording functionality.

## 📋 Overview

The extension provides:
- Meeting audio recording from browser tabs
- Beautiful premium UI in a Chrome side panel
- Real-time status feedback
- Meeting history management
- Task and calendar event handling
- Multi-language support (English, Bengali, Hindi)

## 🏗️ Architecture

```
briefly-ext/
├── manifest.json          # Extension configuration (Manifest V3)
├── sidepanel.html         # Main UI (dark theme)
├── sidepanel.js           # UI logic & extension API
├── background.js          # Service worker (background tasks)
└── icons/                 # Extension icons (16x16, 48x48, 128x128)
```

## 📦 Files & Components

### `manifest.json`
Extension metadata and configuration following Chrome Extension Manifest V3:
- Permissions: `tabCapture`, `storage`, `sidePanel`
- Background service worker
- Side panel configuration
- Icon definitions

### `sidepanel.html`
Main user interface with:
- **Header**: Briefly logo with history button
- **Language Selector**: English, Bengali, Hindi dropdown
- **Recording Controls**: Start/Stop/Pause buttons
- **Results View**:
  - Summary section
  - Action Items (with Create Task buttons)
  - Key Decisions
  - Architecture/Flow Diagram (with Copy button)
  - Upcoming Deadlines
  - Meeting Chat
  - Export buttons (Download TXT, Copy for Notion)
- **History View**: Past meetings with delete functionality
- **Global Chat**: Cross-meeting search and Q&A

### `sidepanel.js`
Main logic layer handling:
- Event listeners for all UI buttons
- Chrome API calls (`tabCapture`, `storage`)
- Audio blob handling and upload
- API communication with backend
- DOM manipulation and state management
- Local storage and history management

### `background.js`
Service worker (runs in background):
- Handles extension lifecycle
- Manages long-running tasks
- Maintains state across popup closes/opens

---

## 🎨 UI Components & Color Scheme

### Design System

**Dark Theme Colors**:
- Background Base: `#0B0F19` (Very dark blue)
- Card Background: `rgba(17, 24, 39, 0.7)` (Semi-transparent)
- Border: `#1F2937` (Dark gray)
- Text Main: `#F9FAFB` (Off-white)
- Text Muted: `#9CA3AF` (Light gray)

**Accent Colors**:
- Primary Gradient: `#38bdf8` (Cyan) → `#0284c7` (Blue)
- Recording Red: `#f43f5e` (Rose)
- Success Green: `#10b981` (Emerald)
- Processing Blue: `#0ea5e9` (Sky)

### Component States

**Status Pills**:
- Recording: Red background with animation
- Processing: Purple background
- Complete: Green background

**Buttons**:
- Primary (Start/Stop): Gradient cyan-blue with hover effect
- Secondary (Pause/Action): Themed with component-specific colors
- Icon buttons: Hover reveals background

**Modal**: Centered dark card with icon-based headers

---

## 🚀 Installation & Development

### Prerequisites
- Chrome/Chromium browser
- Text editor or IDE
- Backend API running at `http://127.0.0.1:8000`

### Installation Steps

1. **Open Chrome Extensions**:
   - Go to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right)

2. **Load unpacked extension**:
   - Click **Load unpacked**
   - Navigate to `briefly-ext` folder
   - Select and open

3. **Verify installation**:
   - Extension icon should appear in toolbar
   - Click to open side panel
   - Should show "Ready" status

4. **Check backend connection**:
   - Ensure backend is running: `uvicorn main:app --reload`
   - Backend should be at `http://127.0.0.1:8000`
   - Check browser console for errors: F12 → Console tab

### Development Workflow

1. **Make changes** to HTML/JS/CSS files
2. **Reload extension** on `chrome://extensions/` (click reload icon)
3. **Test in side panel**: Click extension icon and verify changes
4. **Check console** for errors: F12 → Console

### Debug Mode

1. **Open DevTools**: Press F12 while side panel is open
2. **Check Console**: Logs show errors and processing status
3. **Check Network**: View API calls to backend
4. **Check Application**: View Chrome storage contents

---

## 📱 UI Workflow

### Recording Flow

```
1. User clicks "Start AI Recording"
   ↓
2. Browser asks for screen/tab permission
   ↓
3. User selects tab with meeting audio
   ↓
4. Status shows "Recording" (with animation)
   ↓
5. User can Pause/Resume
   ↓
6. User clicks "Summarize" (stop)
   ↓
7. Status shows "Analyzing"
   ↓
8. Results displayed (Summary, Actions, Decisions, etc.)
   ↓
9. Status shows "Complete" (with green pill)
```

### Result Display Flow

```
Summary
  ↓
Action Items (with Create Task button)
  ↓
Key Decisions
  ↓
Architecture Diagram (if present)
  OR
"Diagram is not needed here" (if no diagram)
  ↓
Upcoming Deadlines (if any)
  ↓
Chat with Meeting section
  ↓
Export options (Download, Copy for Notion)
```

---

## 🔧 Key Functions

### Recording
```javascript
// Start recording
startBtn.addEventListener('click', async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true
  });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start();
});

// Stop recording
stopBtn.addEventListener('click', () => {
  mediaRecorder.stop();
});
```

### Audio Upload
```javascript
async function processAudio() {
  const audioBlob = new Blob(audioChunks, { type: 'video/webm' });
  const formData = new FormData();
  formData.append('file', audioBlob, 'meeting.webm');
  formData.append('language', languageSelect.value);
  
  const response = await fetch(`${API_BASE_URL}/process-audio`, {
    method: 'POST',
    body: formData
  });
  const result = await response.json();
  displayResults(result.data);
}
```

### Display Results
```javascript
function displayResults(data) {
  document.getElementById('summaryText').innerText = data.summary;
  
  // Populate action items with Create Task buttons
  data.action_items.forEach(item => {
    const li = document.createElement('li');
    li.innerText = item;
    // Add button with click handler
    actionList.appendChild(li);
  });
  
  // Display diagram or fallback message
  if (data.mermaid_diagram && data.mermaid_diagram.trim() !== '') {
    displayDiagram(data.mermaid_diagram);
  } else {
    showMessage("Diagram is not needed here");
  }
}
```

### Task Generation
```javascript
async function generateJiraTicket(actionItem, transcript, language) {
  const response = await fetch(`${API_BASE_URL}/generate-ticket`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action_item: actionItem,
      transcript: transcript,
      language: language
    })
  });
  const res = await response.json();
  displayTicketModal(res.ticket);
}
```

### Local Storage
```javascript
function saveToHistory(data) {
  const historyItem = {
    timestamp: new Date().toISOString(),
    language: data.language,
    summary: data.summary,
    action_items: data.action_items,
    // ... other fields
  };
  
  chrome.storage.local.get({ meetingHistory: [] }, (result) => {
    const history = result.meetingHistory;
    history.unshift(historyItem);
    chrome.storage.local.set({ meetingHistory: history });
  });
}
```

---

## 🌍 Multilingual Support

### Language Selection
User selects output language in dropdown:
- English
- Bengali (বাংলা)
- Hindi (हिन्दी)

### Language Flow
1. User selects language
2. Language sent to backend in `/process-audio` request
3. Backend processes meeting in selected language
4. Results displayed in selected language
5. Language saved with meeting record

### Output Language Handling
- **Summary**: User-selected language
- **Action Items**: User-selected language
- **Key Decisions**: User-selected language
- **Transcript**: Original spoken language (unmodified)
- **Mermaid Diagram**: Always English (for rendering reliability)
- **Task Details**: User-selected language (when generated)

---

## 💾 Data Storage

### Chrome Storage Structure
```javascript
{
  meetingHistory: [
    {
      timestamp: "ISO 8601 string",
      language: "English|Bengali|Hindi",
      summary: "string",
      action_items: ["string"],
      decisions: ["string"],
      transcript: "string",
      mermaid_diagram: "string",
      calendar_events: [
        {
          title: "string",
          start_time_iso: "ISO 8601",
          end_time_iso: "ISO 8601",
          description: "string"
        }
      ]
    },
    // ... more meetings
  ]
}
```

### Storage Limits
- Chrome storage: ~10MB per extension
- Typical meeting record: 50-200KB
- Can store ~50-100 meetings before cleanup needed

---

## 🔌 API Communication

### Backend Connection
- Base URL: `http://127.0.0.1:8000`
- All requests use `Content-Type: application/json` or `multipart/form-data`
- CORS enabled (accepts any origin)

### Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `/process-audio` | Upload and analyze meeting audio |
| `/generate-ticket` | Create task details from action item |
| `/chat` | Ask question about current meeting |
| `/chat-global` | Search across all meetings |

### Error Handling
```javascript
try {
  const response = await fetch(`${API_BASE_URL}/process-audio`, {
    method: 'POST',
    body: formData
  });
  const result = await response.json();
  
  if (response.ok && result.status === "success") {
    displayResults(result.data);
  } else {
    throw new Error(result.message || 'Unknown error');
  }
} catch (err) {
  statusBox.innerText = `Error: ${err.message}`;
  console.error('Failed:', err);
}
```

---

## 🎯 Core Features Implemented

### ✅ Recording & Transcription
- Audio capture from browser tabs
- Upload to backend
- AI transcription with Gemini
- Fallback handling

### ✅ Multilingual Output
- English, Bengali, Hindi support
- Language-aware summarization
- Proper Unicode rendering

### ✅ Result Extraction
- Summary generation
- Action item identification
- Key decision extraction
- Calendar event parsing

### ✅ Diagram Generation
- Mermaid.js flowchart creation
- English-only labels (for rendering reliability)
- Copy-to-clipboard functionality
- Fallback message: "Diagram is not needed here"

### ✅ Task Management
- One-click task creation
- Language-aware ticket generation
- Copy to clipboard
- Jira-compatible format

### ✅ History Management
- Persistent meeting storage
- Quick access with previews
- Delete individual or all meetings
- Sorted by date (newest first)

### ✅ Chat Functionality
- Per-meeting Q&A
- Global cross-meeting search
- Multi-turn conversations
- Context-aware responses

### ✅ Export Options
- Download as TXT
- Copy for Notion (Markdown format)
- One-click copy with confirmation

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Extension not appearing | Reload at `chrome://extensions/` |
| "Connection refused" | Backend not running—start with `uvicorn main:app --reload` |
| Permission popup not showing | Try different tab/website |
| No audio capture | Check system permissions—grant microphone access |
| Results not displaying | Check browser console (F12) for errors |
| API timeout | Audio processing taking long—wait 60+ seconds |
| Language not working | Ensure backend is updated with language prompt |

---

## 🔐 Permissions & Security

### Required Permissions (in manifest.json)
```json
"permissions": [
  "tabCapture",           // Record tab audio
  "storage",              // Store meeting records locally
  "sidePanel"             // Display side panel
]
```

### Security Notes
- No data sent to third parties except Google Gemini API
- Meeting data stored locally in Chrome storage only
- API key stored in `.env` (backend only)
- HTTPS recommended for production

---

## 📝 License

Part of the Briefly hackathon project. All rights reserved.
