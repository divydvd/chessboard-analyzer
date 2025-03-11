
// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'captureImage' && message.imageUrl) {
    fetchImageAsBase64(message.imageUrl)
      .then(base64Image => {
        chrome.runtime.sendMessage({
          action: 'imageFromUrl',
          image: base64Image
        });
      })
      .catch(error => {
        console.error('Error fetching image:', error);
        chrome.runtime.sendMessage({
          action: 'error',
          error: 'Failed to fetch image: ' + error.message
        });
      });
  }
});

// Fetch an image and convert it to base64
async function fetchImageAsBase64(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Extract the base64 data part (remove the data URL prefix)
        const base64data = reader.result.split(',')[1];
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
}
