'use client';

import { useState } from 'react';

export const RecorderButton = () => {
  const [isRecording, setIsRecording] = useState(false);

  const handleStartRecording = () => {
    // Logic to start recording
    setIsRecording(true);
    console.log('Recording started');
  };

  const handleStopRecording = () => {
    // Logic to stop recording
    setIsRecording(false);
    console.log('Recording stopped');
  };

  return (
    <button
      onClick={isRecording ? handleStopRecording : handleStartRecording}
      className={`px-4 py-2 rounded-md text-white ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
    >
      {isRecording ? 'Stop Recording' : 'Start Recording'}
    </button>
  );
};
