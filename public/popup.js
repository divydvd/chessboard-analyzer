
// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const processingState = document.getElementById('processingState');
const resultState = document.getElementById('resultState');
const errorState = document.getElementById('errorState');
const pgnResult = document.getElementById('pgnResult');
const copyPgn = document.getElementById('copyPgn');
const analyzeOnLichess = document.getElementById('analyzeOnLichess');
const tryAgain = document.getElementById('tryAgain');
const errorMessage = document.getElementById('errorMessage');
const historyItems = document.getElementById('historyItems');
const usageCount = document.getElementById('usageCount');

// State variables
let currentPgn = '';
let dropZoneActive = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeUI();
  loadHistory();
  updateUsageCount();
});

function initializeUI() {
  // Set up the drop zone
  dropZone.addEventListener('click', () => {
    fileInput.click();
  });
  
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!dropZoneActive) {
      dropZone.classList.add('border-primary');
      dropZoneActive = true;
    }
  });
  
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-primary');
    dropZoneActive = false;
  });
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-primary');
    dropZoneActive = false;
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  });
  
  // Handle file selection
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      processImageFile(fileInput.files[0]);
    }
  });
  
  // Button event listeners
  copyPgn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentPgn)
      .then(() => {
        showNotification('PGN copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy PGN:', err);
      });
  });
  
  analyzeOnLichess.addEventListener('click', () => {
    if (!currentPgn) return;
    
    const lichessImportURL = "https://lichess.org/analysis/paste";
    
    // Create a hidden form to submit the PGN to Lichess
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = lichessImportURL;
    form.target = '_blank';
    
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'pgn';
    input.value = currentPgn;
    
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  });
  
  tryAgain.addEventListener('click', () => {
    showInitialState();
  });
}

function processImageFile(file) {
  showProcessingState();
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64Image = e.target.result.split(',')[1];
    
    // Get API config from Chrome storage
    chrome.storage.local.get(['provider', 'apiKey'], (config) => {
      if (!config.provider || !config.apiKey) {
        showErrorState('API configuration missing. Please go to settings and set up your API keys.');
        return;
      }
      
      // Process with selected AI provider
      if (config.provider === 'deepseek') {
        processWithDeepseek(base64Image, config.apiKey);
      } else if (config.provider === 'openai') {
        processWithOpenAI(base64Image, config.apiKey);
      } else {
        showErrorState('Invalid AI provider selected');
      }
    });
  };
  
  reader.onerror = () => {
    showErrorState('Failed to read image file');
  };
  
  reader.readAsDataURL(file);
}

function processWithDeepseek(base64Image, apiKey) {
  fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-vision",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: createChessPrompt() },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 1000
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      throw new Error(data.error.message || 'DeepSeek API error');
    }
    
    const pgn = extractPGNFromResponse(data.choices[0].message.content);
    if (!pgn) {
      throw new Error('Could not extract valid PGN from response');
    }
    
    showResultState(pgn);
    addToHistory(pgn);
    updateUsageCount(true);
  })
  .catch(error => {
    console.error('DeepSeek API error:', error);
    showErrorState(error.message || 'Failed to analyze image with DeepSeek');
  });
}

function processWithOpenAI(base64Image, apiKey) {
  fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a chess position analyzer that identifies positions from images and returns only valid PGN notation."
        },
        {
          role: "user", 
          content: [
            { type: "text", text: createChessPrompt() },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      max_tokens: 1000
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      throw new Error(data.error.message || 'OpenAI API error');
    }
    
    const pgn = extractPGNFromResponse(data.choices[0].message.content);
    if (!pgn) {
      throw new Error('Could not extract valid PGN from response');
    }
    
    showResultState(pgn);
    addToHistory(pgn);
    updateUsageCount(true);
  })
  .catch(error => {
    console.error('OpenAI API error:', error);
    showErrorState(error.message || 'Failed to analyze image with OpenAI');
  });
}

function createChessPrompt() {
  return `
  Analyze this chessboard image and provide the exact position in PGN (Portable Game Notation) format.
  Only output the valid PGN notation with no additional text or explanations.
  If the board orientation is ambiguous, assume White is playing from the bottom.
  Include FEN notation if you can determine it.
  Be precise about piece positions, especially for similar-looking pieces like knights and pawns.
  `;
}

function extractPGNFromResponse(response) {
  // Try to extract PGN notation from text
  // Look for common PGN format patterns
  
  // First, check if response contains [Event or [Site which typically start PGN
  if (response.includes("[Event") || response.includes("[Site")) {
    // Try to extract the complete PGN block
    const pgnMatch = response.match(/\[\s*Event.*?\s*(?:\d+\.\s*\S+\s+\S+\s*)+(?:\*|1-0|0-1|1\/2-1\/2)/s);
    if (pgnMatch) return pgnMatch[0].trim();
  }
  
  // If we can't find standard PGN format, try looking for FEN notation
  const fenMatch = response.match(/([rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+\s[wb]\s[KQkq-]+\s[a-h\-][1-8\-]/);
  if (fenMatch) {
    // Convert FEN to minimal PGN
    return `[SetUp "1"]\n[FEN "${fenMatch[0]}"]\n\n*`;
  }
  
  // If all else fails, just return the response as-is if it seems to contain chess notation
  if (response.match(/\d+\.\s*[KQRBNP]?[a-h]?[1-8]?x?[a-h][1-8]/)) {
    return response.trim();
  }
  
  // Handle case where the API might have wrapped the PGN in code blocks
  if (response.includes("```")) {
    const codeBlockMatch = response.match(/```(?:pgn)?\s*([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      return codeBlockMatch[1].trim();
    }
  }
  
  return response.trim(); // Return the full response as a fallback
}

function showInitialState() {
  dropZone.style.display = 'flex';
  processingState.style.display = 'none';
  resultState.style.display = 'none';
  errorState.style.display = 'none';
}

function showProcessingState() {
  dropZone.style.display = 'none';
  processingState.style.display = 'flex';
  resultState.style.display = 'none';
  errorState.style.display = 'none';
}

function showResultState(pgn) {
  dropZone.style.display = 'none';
  processingState.style.display = 'none';
  resultState.style.display = 'flex';
  errorState.style.display = 'none';
  
  currentPgn = pgn;
  pgnResult.textContent = pgn;
}

function showErrorState(message) {
  dropZone.style.display = 'none';
  processingState.style.display = 'none';
  resultState.style.display = 'none';
  errorState.style.display = 'flex';
  
  errorMessage.textContent = message;
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-secondary py-2 px-4 rounded-lg shadow-md text-xs font-medium animate-fade-in';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.remove('animate-fade-in');
    notification.classList.add('animate-fade-out');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 2000);
}

function addToHistory(pgn) {
  chrome.storage.local.get({ history: [] }, (data) => {
    const history = data.history;
    
    // Add new entry to the beginning of the array
    history.unshift({
      pgn: pgn,
      timestamp: Date.now()
    });
    
    // Limit history to 5 entries
    if (history.length > 5) {
      history.pop();
    }
    
    // Save updated history
    chrome.storage.local.set({ history: history }, () => {
      loadHistory();
    });
  });
}

function loadHistory() {
  chrome.storage.local.get({ history: [] }, (data) => {
    const history = data.history;
    
    if (history.length === 0) {
      historyItems.innerHTML = '<p class="text-center py-2">No recent analyses</p>';
      return;
    }
    
    historyItems.innerHTML = '';
    
    history.forEach((item, index) => {
      const historyItem = document.createElement('div');
      historyItem.className = 'py-2 border-b border-border last:border-b-0 cursor-pointer hover:bg-secondary/50 px-2 rounded transition-colors';
      
      const date = new Date(item.timestamp);
      const dateString = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const timeString = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      
      const shortPgn = item.pgn.split('\n')[0] || 'Chess position';
      
      historyItem.innerHTML = `
        <div class="flex justify-between items-center">
          <span class="font-medium truncate" style="max-width: 200px;">${shortPgn}</span>
          <span class="text-muted-foreground">${dateString}, ${timeString}</span>
        </div>
      `;
      
      historyItem.addEventListener('click', () => {
        showResultState(item.pgn);
      });
      
      historyItems.appendChild(historyItem);
    });
  });
}

function updateUsageCount(increment = false) {
  chrome.storage.local.get({ usageCount: 0 }, (data) => {
    let count = data.usageCount;
    
    if (increment) {
      count += 1;
      chrome.storage.local.set({ usageCount: count });
    }
    
    const maxFree = 3;
    usageCount.textContent = `Analyses: ${count}/${maxFree}`;
    
    if (count >= maxFree) {
      showFreemiumLimit();
    }
  });
}

function showFreemiumLimit() {
  // This is where you'd implement premium upsell
  // For now, just changing the text color to indicate limit
  usageCount.classList.add('text-destructive');
}
