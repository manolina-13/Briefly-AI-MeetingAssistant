// content.js
console.log("Meeting Muse: Content script loaded.");

let isRecording = false;

function injectRecordButton() {
  // Check if button already exists
  if (document.getElementById('muse-record-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'muse-record-btn';
  
  // Create a stylish, floating button that won't break if Google Meet updates its code
  btn.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 24px;
    z-index: 99999;
    padding: 12px 20px;
    background-color: #6366f1;
    color: white;
    border: none;
    border-radius: 8px;
    font-family: 'Google Sans', 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
  `;

  btn.innerHTML = `<span id="muse-dot" style="display:inline-block; width:10px; height:10px; background-color:#fff; border-radius:50%;"></span> <span id="muse-text">Start Muse</span>`;

  // Hover effects
  btn.onmouseover = () => {
    if (!isRecording) btn.style.backgroundColor = '#4f46e5';
  };
  btn.onmouseout = () => {
    if (!isRecording) btn.style.backgroundColor = '#6366f1';
  };

  btn.addEventListener('click', () => {
    isRecording = !isRecording;
    
    if (isRecording) {
      btn.style.backgroundColor = '#ef4444'; // Red for recording
      document.getElementById('muse-dot').style.animation = 'muse-pulse 1.5s infinite';
      document.getElementById('muse-text').innerText = 'Stop Muse';
      chrome.runtime.sendMessage({ action: 'START_RECORDING' });
    } else {
      btn.style.backgroundColor = '#6366f1'; // Back to primary color
      document.getElementById('muse-dot').style.animation = 'none';
      document.getElementById('muse-text').innerText = 'Start Muse';
      chrome.runtime.sendMessage({ action: 'STOP_RECORDING' });
    }
  });

  document.body.appendChild(btn);

  // Inject CSS animation for the recording dot
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes muse-pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.2); }
      100% { opacity: 1; transform: scale(1); }
    }
  `;
  document.head.appendChild(style);
}

// Since Google Meet is a single-page app, the page doesn't always reload.
// We use a MutationObserver to ensure our button is injected when the DOM changes.
const observer = new MutationObserver(() => {
  // Only inject if the URL is an actual meeting URL (e.g., meet.google.com/abc-defg-hij)
  if (window.location.pathname.length > 2) {
    injectRecordButton();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Also try injecting immediately on page load
if (window.location.pathname.length > 2) {
  injectRecordButton();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ALERT_MODELS') {
    alert("Google API says you have access to:\\n" + request.models + "\\n\\nPlease tell the AI assistant which gemini-1.5 models are listed here!");
  }
});
