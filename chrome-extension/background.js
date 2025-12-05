import { createClient } from '@supabase/supabase-js';
import { LiveTranscriptionEvents, LiveSchema, createClient as createDeepgramClient } from '@deepgram/sdk';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL; // Not directly accessible in extension background.js
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Not directly accessible in extension background.js
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY; // Not directly accessible in extension background.js

// In a real scenario, you'd load these from chrome.storage or a config file bundled with the extension
// For now, these are placeholders and assumed to be available to the extension context.
const NEXT_APP_URL = "http://localhost:3000"; // Replace with your deployed Next.js app URL

let mediaRecorder;
let audioChunks = [];
let deepgramWs;
let recordingTabId;
let currentMeetingId;
let currentUserId; // This needs to be set after user logs in via extension popup or content script

// Supabase client for the background script (ensure it's initialized with public key)
// In a production extension, you might use a service account key or handle auth differently
// due to security implications of storing anon key directly in the extension.
// For now, we'll use a simplified approach.
const supabaseClient = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

async function getUserId() {
  // In a real extension, you'd likely get this from chrome.storage after a successful login
  // or pass it from the content script/popup.
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user?.id;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startRecording") {
    startRecording(message.tabId, message.userId);
    sendResponse({ status: "recordingStarted" });
  } else if (message.action === "stopRecording") {
    stopRecording();
    sendResponse({ status: "recordingStopped" });
  } else if (message.action === "getRecordingStatus") {
    sendResponse({ isRecording: !!mediaRecorder, meetingId: currentMeetingId });
  } else if (message.action === "setUserId") {
    currentUserId = message.userId;
  }
  return true; // Keep the message channel open for sendResponse
});

async function startRecording(tabId, userId) {
  recordingTabId = tabId;
  currentUserId = userId; // Ensure userId is set

  if (!currentUserId) {
    console.error("User not logged in to start recording.");
    chrome.runtime.sendMessage({ action: "recordingError", error: "User not authenticated." });
    return;
  }

  try {
    // 1. Notify backend about meeting start
    const startMeetingResponse = await fetch(`${NEXT_APP_URL}/api/meet-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'meeting_start', userId: currentUserId, title: `Google Meet - ${new Date().toLocaleString()}` }),
    });
    const startMeetingData = await startMeetingResponse.json();
    if (startMeetingData.error) throw new Error(startMeetingData.error);
    currentMeetingId = startMeetingData.meetingId;
    console.log("Meeting started in DB with ID:", currentMeetingId);

    // 2. Capture tab audio
    const stream = await chrome.tabCapture.capture({
      audio: true,
      video: false
    });
    mediaRecorder = new MediaRecorder(stream);

    // 3. Establish WebSocket connection to backend /api/transcribe
    // NOTE: This assumes a WebSocket server is running at NEXT_APP_URL/api/transcribe.
    // In a production Next.js app on Vercel, this usually means a separate dedicated
    // WebSocket server or a serverless function with WebSocket capabilities.
    deepgramWs = new WebSocket(`${NEXT_APP_URL}/api/transcribe?meetingId=${currentMeetingId}&userId=${currentUserId}`);

    deepgramWs.onopen = () => {
      console.log("Backend WebSocket connected");
      chrome.runtime.sendMessage(recordingTabId, { action: "wsConnected" });
      mediaRecorder.start(250); // Send data every 250ms for real-time transcription
    };

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && deepgramWs && deepgramWs.readyState === WebSocket.OPEN) {
        deepgramWs.send(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      stream.getTracks().forEach(track => track.stop());
      console.log("Recording stopped and stream tracks stopped.");
      if (deepgramWs && deepgramWs.readyState === WebSocket.OPEN) {
        deepgramWs.close();
      }
      // Notify content script about recording stop
      chrome.runtime.sendMessage(recordingTabId, { action: "recordingStoppedClient" });
    };

    deepgramWs.onmessage = (event) => {
      // This is where you would receive real-time transcripts from your backend
      // and potentially forward them to the content script for live display.
      console.log("Deepgram transcript chunk received (via backend WS):");
      chrome.tabs.sendMessage(recordingTabId, { action: "newTranscript", transcript: event.data });
    };

    deepgramWs.onclose = (event) => {
      console.log("Backend WebSocket disconnected", event);
      chrome.runtime.sendMessage(recordingTabId, { action: "wsDisconnected" });
      // Implement reconnection logic or error handling if needed
    };

    deepgramWs.onerror = (error) => {
      console.error("Backend WebSocket error:", error);
      chrome.runtime.sendMessage(recordingTabId, { action: "wsError", error: error.message });
      stopRecording(); // Stop recording on WebSocket error
    };

  } catch (error: any) {
    console.error("Error starting recording:", error);
    chrome.runtime.sendMessage({ action: "recordingError", error: error.message });
    stopRecording();
  }
}

async function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    mediaRecorder = null;
    audioChunks = [];
  }
  if (deepgramWs && deepgramWs.readyState === WebSocket.OPEN) {
    deepgramWs.close();
  }

  if (currentMeetingId && currentUserId) {
    // Notify backend about meeting end
    try {
      const endMeetingResponse = await fetch(`${NEXT_APP_URL}/api/meet-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'meeting_end', meetingId: currentMeetingId, userId: currentUserId }),
      });
      const endMeetingData = await endMeetingResponse.json();
      if (endMeetingData.error) throw new Error(endMeetingData.error);
      console.log("Meeting ended in DB for ID:", currentMeetingId);
    } catch (error) {
      console.error("Error sending meeting_end event:", error);
    }
  }

  recordingTabId = null;
  currentMeetingId = null;
  console.log("Recording process fully stopped.");
  chrome.runtime.sendMessage({ action: "recordingStoppedClient" });
}
