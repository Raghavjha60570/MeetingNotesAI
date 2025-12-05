'use client';

import { useState, useRef, useEffect } from 'react';

interface TranscriptChunk {
  timestamp_ms: number;
  text_chunk: string;
}

interface TranscriptViewerProps {
  transcript: TranscriptChunk[];
}

export const TranscriptViewer = ({ transcript }: TranscriptViewerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const viewerRef = useRef<HTMLDivElement>(null);

  const formatTimestamp = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleTimestampClick = (timestamp_ms: number) => {
    if (viewerRef.current) {
      const element = viewerRef.current.querySelector(`[data-timestamp="${timestamp_ms}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const highlightText = (text: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-300 text-black">{part}</span>
      ) : (
        part
      )
    );
  };

  const filteredTranscript = transcript.filter((chunk) =>
    chunk.text_chunk.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4">Transcript</h2>
      <input
        type="text"
        placeholder="Search transcript..."
        className="w-full p-2 rounded-md bg-gray-700 text-white mb-4"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <div ref={viewerRef} className="h-96 overflow-y-auto pr-2">
        {filteredTranscript.map((chunk, index) => (
          <div key={index} className="flex mb-2 items-start">
            <span
              className="text-blue-400 cursor-pointer w-20 flex-shrink-0"
              onClick={() => handleTimestampClick(chunk.timestamp_ms)}
            >
              {formatTimestamp(chunk.timestamp_ms)}
            </span>
            <p data-timestamp={chunk.timestamp_ms} className="ml-4 flex-grow">
              {highlightText(chunk.text_chunk)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
