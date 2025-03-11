
document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveButton = document.getElementById('saveButton');
  const resetButton = document.getElementById('resetButton');
  const providerRadios = document.querySelectorAll('input[name="provider"]');
  
  // Load saved settings
  chrome.storage.local.get(['provider', 'apiKey'], (result) => {
    if (result.provider) {
      document.querySelector(`input[value="${result.provider}"]`).checked = true;
    } else {
      // Default to DeepSeek if not set
      document.querySelector('input[value="deepseek"]').checked = true;
    }
    
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
    }
  });
  
  // Save settings
  saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    const provider = document.querySelector('input[name="provider"]:checked').value;
    
    if (!apiKey) {
      showError('Please enter your API key');
      return;
    }
    
    chrome.storage.local.set({
      provider: provider,
      apiKey: apiKey
    }, () => {
      showSuccess('Settings saved successfully');
    });
  });
  
  // Reset settings
  resetButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset your settings?')) {
      chrome.storage.local.remove(['provider', 'apiKey'], () => {
        apiKeyInput.value = '';
        document.querySelector('input[value="deepseek"]').checked = true;
        showSuccess('Settings reset successfully');
      });
    }
  });
});

function showError(message) {
  showNotification(message, 'error');
}

function showSuccess(message) {
  showNotification(message, 'success');
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 py-2 px-4 rounded-lg shadow-md text-xs font-medium animate-fade-in ${
    type === 'error' ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-foreground'
  }`;
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
