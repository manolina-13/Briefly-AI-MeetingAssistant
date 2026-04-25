let offscreenDocument = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'START_RECORDING') {
    startRecording();
  } else if (request.action === 'STOP_RECORDING') {
    stopRecording();
  } else if (request.action === 'AUDIO_READY') {
    console.log("Meeting Muse: Audio received. Sending to Gemini API...");
    processAudioWithGemini(request.data);
  }
});

async function processAudioWithGemini(base64Audio) {
  try {
    const storageResult = await chrome.storage.local.get(['geminiApiKey']);
    const apiKey = storageResult.geminiApiKey;

    if (!apiKey) {
      console.error("No Gemini API key found. Please save it in the extension popup.");
      return;
    }

    // Upgraded to Gemini 2.0 Flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const promptText = `
      You are an expert meeting assistant. Please listen to the provided meeting audio.
      Return your response ONLY as a valid JSON object (without any markdown formatting) with the following structure:
      {
        "title": "A short title",
        "transcript": "Full text transcript",
        "summaryText": "Short summary",
        "actionItems": ["action 1"],
        "keyDecisions": ["decision 1"]
      }
    `;

    const requestBody = {
      contents: [{
        parts: [
          { text: promptText },
          { inline_data: { mime_type: "audio/webm", data: base64Audio } }
        ]
      }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.error) {
      console.error("Gemini API Error:", data.error.message);
      return;
    }

    const aiResponseText = data.candidates[0].content.parts[0].text;
    const cleanJsonText = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const meetingData = JSON.parse(cleanJsonText);
    meetingData.timestamp = Date.now();

    saveSummaryToStorage(meetingData);

  } catch (err) {
    console.error("Meeting Muse Error processing AI:", err);
  }
}

async function saveSummaryToStorage(newSummary) {
  const result = await chrome.storage.local.get(['meetingSummaries']);
  const summaries = result.meetingSummaries || [];
  summaries.push(newSummary);
  await chrome.storage.local.set({ meetingSummaries: summaries });
  console.log("Meeting Muse: Summary saved!");
}

async function startRecording() {
  await setupOffscreenDocument('offscreen.html');
  chrome.runtime.sendMessage({ action: 'START_OFFSCREEN_RECORDING' });
}

async function stopRecording() {
  chrome.runtime.sendMessage({ action: 'STOP_OFFSCREEN_RECORDING' });
}

async function setupOffscreenDocument(path) {
  if (await hasOffscreenDocument(path)) return;
  
  await chrome.offscreen.createDocument({
    url: path,
    reasons: ['USER_MEDIA'],
    justification: 'Recording meeting audio for AI summarization'
  });
}

async function hasOffscreenDocument(path) {
  const matchedClients = await clients.matchAll();
  return matchedClients.some(c => c.url.endsWith(path));
}
