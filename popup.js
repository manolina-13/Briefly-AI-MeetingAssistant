document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');
  const statusMsg = document.getElementById('statusMsg');
  const summariesList = document.getElementById('summariesList');
  const clearBtn = document.getElementById('clearBtn');

  // Load existing API key and summaries
  chrome.storage.local.get(['geminiApiKey', 'meetingSummaries'], (result) => {
    if (result.geminiApiKey) {
      apiKeyInput.value = result.geminiApiKey;
    }
    
    renderSummaries(result.meetingSummaries || []);
  });

  // Save API key
  saveBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (!key) return;

    chrome.storage.local.set({ geminiApiKey: key }, () => {
      statusMsg.classList.remove('hidden');
      setTimeout(() => {
        statusMsg.classList.add('hidden');
      }, 2000);
    });
  });

  // Clear all summaries
  clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all meeting summaries?')) {
      chrome.storage.local.set({ meetingSummaries: [] }, () => {
        renderSummaries([]);
      });
    }
  });

  function renderSummaries(summaries) {
    if (!summaries || summaries.length === 0) {
      summariesList.innerHTML = `
        <div class="empty-state">
          <p>No meetings recorded yet.</p>
        </div>
      `;
      return;
    }

    summariesList.innerHTML = '';
    // Reverse to show newest first
    const reversed = [...summaries].reverse();

    reversed.forEach(summary => {
      const card = document.createElement('div');
      card.className = 'summary-card';
      
      const date = new Date(summary.timestamp).toLocaleString();
      
      card.innerHTML = `
        <div class="summary-date">${date}</div>
        <h3 class="summary-title">${summary.title || 'Meeting Summary'}</h3>
        <p class="summary-preview">${summary.summaryText || 'No summary text available.'}</p>
      `;

      // Click to open detailed view (for future enhancement)
      card.addEventListener('click', () => {
        // We can expand this later to show full Action Items and Decisions
        console.log('Clicked summary:', summary);
      });

      summariesList.appendChild(card);
    });
  }
});
