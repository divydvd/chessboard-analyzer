
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
    chrome.runtime.sendMessage({
      action: 'analyzePGN',
      pgn: currentPgn
    });
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
    
    chrome.runtime.sendMessage({
      action: 'analyzeImage',
      image: base64Image
    }, response => {
      if (response.success) {
        showResultState(response.pgn);
        addToHistory(response.pgn);
        updateUsageCount(true);
      } else {
        showErrorState(response.error || 'Failed to analyze image');
      }
    });
  };
  
  reader.onerror = () => {
    showErrorState('Failed to read image file');
  };
  
  reader.readAsDataURL(file);
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
