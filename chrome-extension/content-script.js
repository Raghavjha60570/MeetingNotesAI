// content-script.js

console.log("Content script loaded for Google Meet.");

function injectButtons() {
  const targetElement = document.querySelector('div[data-fpsc="screen-sharing-ui"]'); // Adjust selector as needed
  if (!targetElement) {
    setTimeout(injectButtons, 1000); // Retry after 1 second
    return;
  }

  const existingButtons = document.getElementById('meet-notes-buttons');
  if (existingButtons) return; // Buttons already injected

  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'meet-notes-buttons';
  buttonContainer.style.cssText = `
    position: absolute;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    gap: 10px;
  `;

  const startButton = document.createElement('button');
  startButton.innerText = "Start Recording";
  startButton.className = "px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600";
  startButton.onclick = () => {
    chrome.runtime.sendMessage({ action: "getUserId" }, (response) => {
      if (response && response.userId) {
        chrome.runtime.sendMessage({ action: "startRecording", tabId: chrome.tabs.TAB_ID, userId: response.userId });
      } else {
        alert("Please sign in to the extension popup first.");
      }
    });
  };

  const stopButton = document.createElement('button');
  stopButton.innerText = "Stop Recording";
  stopButton.className = "px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600";
  stopButton.style.display = 'none'; // Initially hidden
  stopButton.onclick = () => {
    chrome.runtime.sendMessage({ action: "stopRecording" });
  };

  const dashboardButton = document.createElement('button');
  dashboardButton.innerText = "View Dashboard";
  dashboardButton.className = "px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600";
  dashboardButton.onclick = () => {
    // Replace with your actual dashboard URL
    window.open("http://localhost:3000/dashboard", "_blank"); 
  };

  buttonContainer.appendChild(startButton);
  buttonContainer.appendChild(stopButton);
  buttonContainer.appendChild(dashboardButton);
  targetElement.appendChild(buttonContainer);

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "recordingStarted") {
      startButton.style.display = 'none';
      stopButton.style.display = 'block';
    } else if (message.action === "recordingStopped" || message.action === "recordingStoppedClient") {
      startButton.style.display = 'block';
      stopButton.style.display = 'none';
    } else if (message.action === "newTranscript") {
      console.log("Content script received transcript:", message.transcript);
      // Here you might update a live transcript display in the Meet UI if desired
    } else if (message.action === "recordingError") {
      alert(`Recording error: ${message.error}`);
      startButton.style.display = 'block';
      stopButton.style.display = 'none';
    }
  });

  // Initial status check
  chrome.runtime.sendMessage({ action: "getRecordingStatus" }, (response) => {
    if (response && response.isRecording) {
      startButton.style.display = 'none';
      stopButton.style.display = 'block';
    } else {
      startButton.style.display = 'block';
      stopButton.style.display = 'none';
    }
  });
}

// Observe for DOM changes to inject buttons when the Meet UI is ready
const observer = new MutationObserver((mutations, obs) => {
  if (document.querySelector('div[data-fpsc="screen-sharing-ui"]')) {
    injectButtons();
    obs.disconnect(); // Stop observing once buttons are injected
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Fallback for immediate injection if element is already present
if (document.querySelector('div[data-fpsc="screen-sharing-ui"]')) {
  injectButtons();
}
