import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { supabase } from '../../src/lib/supabase'; // Adjust path as needed
import "../../src/app/globals.css"; // For Tailwind CSS

const Popup = () => {
  const [user, setUser] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [wsStatus, setWsStatus] = useState("Disconnected");
  const [error, setError] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        chrome.runtime.sendMessage({ action: "setUserId", userId: session.user.id });
      }
    };
    getSession();

    // Get initial recording status
    chrome.runtime.sendMessage({ action: "getRecordingStatus" }, (response) => {
      if (response) {
        setIsRecording(response.isRecording);
      }
    });

    // Listen for messages from background script
    const messageListener = (message) => {
      if (message.action === "recordingStarted") {
        setIsRecording(true);
        setError(null);
      } else if (message.action === "recordingStopped" || message.action === "recordingStoppedClient") {
        setIsRecording(false);
        setError(null);
      } else if (message.action === "wsConnected") {
        setWsStatus("Connected");
        setError(null);
      } else if (message.action === "wsDisconnected") {
        setWsStatus("Disconnected");
      } else if (message.action === "wsError") {
        setWsStatus("Error");
        setError(message.error);
      } else if (message.action === "recordingError") {
        setIsRecording(false);
        setError(`Recording failed: ${message.error}`);
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    // Listen for auth state changes to update user in popup
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        chrome.runtime.sendMessage({ action: "setUserId", userId: session.user.id });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const handleSignIn = async () => {
    // Replace with your actual sign-in URL
    window.open("http://localhost:3000/auth/signin", "_blank");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    chrome.runtime.sendMessage({ action: "setUserId", userId: null }); // Clear user ID in background
  };

  const handleStartRecording = () => {
    if (!user) {
      setError("Please sign in to start recording.");
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.runtime.sendMessage({ action: "startRecording", tabId: tabs[0].id, userId: user.id });
      }
    });
  };

  const handleStopRecording = () => {
    chrome.runtime.sendMessage({ action: "stopRecording" });
  };

  const handleViewDashboard = () => {
    window.open("http://localhost:3000/dashboard", "_blank");
  };

  return (
    <div className="p-4 w-80 bg-gray-900 text-white min-h-48 flex flex-col justify-between">
      <div>
        <h1 className="text-xl font-bold mb-4">Live Meeting Notes</h1>
        {user ? (
          <div className="mb-4">
            <p className="text-sm mb-2">Logged in as: <span className="font-semibold">{user.email}</span></p>
            <p className="text-sm mb-2">Meeting Status: <span className="font-semibold">{isRecording ? "Recording" : "Idle"}</span></p>
            <p className="text-sm mb-4">WebSocket: <span className="font-semibold">{wsStatus}</span></p>
            {error && <p className="text-red-400 text-sm mb-2">Error: {error}</p>}
            <div className="flex flex-col gap-2">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Stop Recording
                </button>
              )}
              <button
                onClick={handleViewDashboard}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                View Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-sm mb-2">You are not logged in.</p>
            <button
              onClick={handleSignIn}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
      {user && (
        <button
          onClick={handleSignOut}
          className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
        >
          Sign Out
        </button>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<Popup />);
