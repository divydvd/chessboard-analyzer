
document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveButton = document.getElementById('saveButton');
  const resetButton = document.getElementById('resetButton');
  
  // Load current API key
  chrome.storage.local.get(['apiKey'], (data) => {
    if (data.apiKey) {
      apiKeyInput.value = data.apiKey;
    }
  });
  
  // Save settings
  saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    
    chrome.storage.local.set({ apiKey: apiKey }, () => {
      const saveStatus = document.createElement('p');
      saveStatus.textContent = 'Settings saved';
      saveStatus.className = 'text-sm text-primary mt-2 animate-fade-in';
      
      saveButton.parentNode.appendChild(saveStatus);
      
      setTimeout(() => {
        saveStatus.classList.remove('animate-fade-in');
        saveStatus.classList.add('animate-fade-out');
        setTimeout(() => {
          saveButton.parentNode.removeChild(saveStatus);
        }, 300);
      }, 2000);
    });
  });
  
  // Reset settings
  resetButton.addEventListener('click', () => {
    apiKeyInput.value = '';
    chrome.storage.local.set({ apiKey: '', usageCount: 0 }, () => {
      const resetStatus = document.createElement('p');
      resetStatus.textContent = 'Settings reset';
      resetStatus.className = 'text-sm text-primary mt-2 animate-fade-in';
      
      resetButton.parentNode.appendChild(resetStatus);
      
      setTimeout(() => {
        resetStatus.classList.remove('animate-fade-in');
        resetStatus.classList.add('animate-fade-out');
        setTimeout(() => {
          resetButton.parentNode.removeChild(resetStatus);
        }, 300);
      }, 2000);
    });
  });
});
