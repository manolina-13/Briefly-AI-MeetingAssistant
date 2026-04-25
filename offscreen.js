let mediaRecorder;
let recordedChunks = [];
let sourceStream;

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'START_OFFSCREEN_RECORDING') {
    startRecording();
  } else if (request.action === 'STOP_OFFSCREEN_RECORDING') {
    stopRecording();
  }
});

async function startRecording() {
  try {
    // 1. Request screen share (Required to get the tab's audio)
    // The user will see a popup asking them to pick the tab and share audio.
    sourceStream = await navigator.mediaDevices.getDisplayMedia({
      video: { displaySurface: "browser" },
      audio: true
    });

    // 2. We only care about the AUDIO for Gemini. 
    // We discard the video track to keep the file size extremely small!
    const audioTrack = sourceStream.getAudioTracks()[0];
    if (!audioTrack) {
      console.error("Meeting Muse: No audio track found. Please ensure 'Share tab audio' was checked.");
      return;
    }

    const audioStream = new MediaStream([audioTrack]);
    
    // 3. Start recording the audio stream as a WebM audio file
    mediaRecorder = new MediaRecorder(audioStream, { mimeType: 'audio/webm' });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      // 4. Combine the chunks into a single file
      const blob = new Blob(recordedChunks, { type: 'audio/webm' });
      recordedChunks = [];
      
      // Stop all tracks (video and audio) to remove the "sharing screen" banner
      sourceStream.getTracks().forEach(track => track.stop());

      // 5. Convert to Base64 so we can easily send it to Gemini via JSON
      const base64 = await blobToBase64(blob);
      
      // 6. Send the Base64 audio back to the background script
      chrome.runtime.sendMessage({ 
        action: 'AUDIO_READY', 
        data: base64 
      });
    };

    mediaRecorder.start();
    console.log("Meeting Muse: Audio recording started.");

  } catch (err) {
    console.error("Meeting Muse Error starting recording:", err);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
}

// Utility to convert a file/blob to a Base64 string
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    // reader.result includes "data:audio/webm;base64,....." 
    // We split on ',' and return just the raw base64 data for the API
    reader.onloadend = () => resolve(reader.result.split(',')[1]); 
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
