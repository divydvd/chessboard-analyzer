// Configuration
const API_ENDPOINT = 'https://api.deepseek.com/vision/analyze';
const API_KEY = ''; // To be set by user in chrome.storage.local

// Initialize the extension
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu item
  chrome.contextMenus.create({
    id: 'analyzeChessboard',
    title: 'Analyze Chessboard Image',
    contexts: ['image']
  });
  
  // Initialize storage
  chrome.storage.local.get(['apiKey', 'usageCount', 'history'], (data) => {
    if (!data.apiKey) {
      chrome.storage.local.set({ apiKey: '' });
    }
    
    if (typeof data.usageCount === 'undefined') {
      chrome.storage.local.set({ usageCount: 0 });
    }
    
    if (!data.history) {
      chrome.storage.local.set({ history: [] });
    }
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyzeChessboard') {
    if (info.srcUrl) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'captureImage',
        imageUrl: info.srcUrl
      });
    }
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'analyzeImage':
      analyzeChessboardImage(message.image)
        .then(pgn => {
          sendResponse({ success: true, pgn });
        })
        .catch(error => {
          console.error('Analysis error:', error);
          sendResponse({ 
            success: false, 
            error: error.message || 'Failed to analyze the chessboard image.' 
          });
        });
      return true; // Indicate async response
      
    case 'analyzePGN':
      importToLichess(message.pgn);
      return false;
      
    case 'imageFromUrl':
      analyzeChessboardImage(message.image)
        .then(pgn => {
          chrome.storage.local.get({ usageCount: 0 }, (data) => {
            const count = data.usageCount + 1;
            chrome.storage.local.set({ usageCount: count });
            
            // Add to history
            chrome.storage.local.get({ history: [] }, (historyData) => {
              const history = historyData.history;
              history.unshift({
                pgn: pgn,
                timestamp: Date.now()
              });
              
              if (history.length > 5) {
                history.pop();
              }
              
              chrome.storage.local.set({ history: history });
            });
            
            // Import directly to Lichess
            importToLichess(pgn);
          });
        })
        .catch(error => {
          console.error('Analysis error:', error);
          // Notify the user about the error
          chrome.tabs.create({
            url: chrome.runtime.getURL('error.html') + 
                 '?error=' + encodeURIComponent(error.message || 'Failed to analyze image')
          });
        });
      return false;
  }
});

// Analyze chessboard image using DeepSeek Vision API
async function analyzeChessboardImage(base64Image) {
  // Get API key from storage
  const data = await chrome.storage.local.get(['apiKey']);
  const apiKey = data.apiKey;
  
  if (!apiKey) {
    throw new Error('API key not set. Please set your DeepSeek API key in the extension settings.');
  }
  
  // Check usage limits
  const usageData = await chrome.storage.local.get(['usageCount']);
  const currentUsage = usageData.usageCount || 0;
  
  if (currentUsage >= 3) {
    throw new Error('Free usage limit reached. Please upgrade to premium for unlimited analyses.');
  }
  
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        image: base64Image,
        prompt: "This is a chess board. Analyze the position and provide the FEN notation and PGN representation of the current position.",
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }
    
    const result = await response.json();
    
    // Extract PGN from the AI response
    // This is a simplified extraction - in a real implementation,
    // you'd need more robust parsing based on the actual API response format
    const pgn = extractPGNFromResponse(result.response || result.content || '');
    
    if (!pgn) {
      throw new Error('Could not extract valid PGN from the analysis.');
    }
    
    return pgn;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Extract PGN from API response text
function extractPGNFromResponse(text) {
  // This is a simplified extraction that looks for content between ```pgn and ```
  // In a real implementation, you'd need more robust parsing based on the actual API response
  
  // Try to find PGN block in markdown format
  const pgnRegex = /```(?:pgn)?\s*([\s\S]*?)```/i;
  const pgnMatch = text.match(pgnRegex);
  
  if (pgnMatch && pgnMatch[1]) {
    return pgnMatch[1].trim();
  }
  
  // If no markdown block, look for lines that look like PGN
  const lines = text.split('\n');
  let pgnLines = [];
  let inPgn = false;
  
  for (const line of lines) {
    if (line.includes('[Event') || line.includes('[Site')) {
      inPgn = true;
    }
    
    if (inPgn) {
      pgnLines.push(line);
    }
    
    // Simple heuristic for end of PGN - can be improved
    if (inPgn && line.includes('1-0') || line.includes('0-1') || line.includes('1/2-1/2')) {
      break;
    }
  }
  
  if (pgnLines.length > 0) {
    return pgnLines.join('\n');
  }
  
  // If all else fails, return the whole text as PGN
  // In a real implementation, you might want to do more validation here
  return text;
}

// Import PGN to Lichess for analysis
async function importToLichess(pgn) {
  try {
    // Try to extract a FEN string from the PGN
    const fenMatch = pgn.match(/\[FEN\s+"([^"]+)"\]/);
    let fenString = null;
    
    if (fenMatch && fenMatch[1]) {
      fenString = fenMatch[1];
    } else {
      // Try direct FEN pattern match
      const directFenMatch = pgn.match(/([rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+\s[wb]\s[KQkq-]+\s[a-h\-][1-8\-]/);
      if (directFenMatch) {
        fenString = directFenMatch[0];
      }
    }
    
    if (fenString) {
      // If we have a FEN string, use it directly in the URL
      const encodedFEN = encodeURIComponent(fenString);
      const lichessURL = `https://lichess.org/analysis/${encodedFEN}`;
      chrome.tabs.create({ url: lichessURL });
      return;
    }
    
    // If no FEN, use form submission
    const formData = new FormData();
    formData.append('pgn', pgn);
    
    const response = await fetch("https://lichess.org/analysis", {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Lichess import failed with status ${response.status}`);
    }
    
    const result = await response.json();
    
    // Open the analysis URL in a new tab
    if (result.url) {
      chrome.tabs.create({ url: result.url });
    } else {
      throw new Error('No analysis URL returned from Lichess');
    }
  } catch (error) {
    console.error('Lichess import failed:', error);
    // Show error page or notification
    chrome.tabs.create({
      url: chrome.runtime.getURL('error.html') + 
           '?error=' + encodeURIComponent('Failed to import to Lichess: ' + error.message)
    });
  }
}
