import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LiveTranscriptionEvents, LiveSchema, createClient as createDeepgramClient } from '@deepgram/sdk';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !DEEPGRAM_API_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing environment variables for Supabase or Deepgram');
}

// Initialize Supabase client with service role for server-side operations
const supabaseServiceRole = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Helper to create a Deepgram client (not live client)
const deepgram = createDeepgramClient(DEEPGRAM_API_KEY);

// This is a conceptual API route for handling WebSocket connections in a Next.js Edge runtime.
// Directly implementing a full WebSocket server within `route.ts` in the Edge runtime
// as of current Next.js versions (v15) is not straightforward and typically requires
// a dedicated WebSocket server (e.g., using `ws` library on a Node.js server) or a
// serverless function provider that explicitly supports WebSocket upgrades.

// For the purpose of this project, we will outline the intended logic if a WebSocket
// connection were successfully established and managed by an external or custom server.
// The client-side (Chrome Extension) will attempt to connect to this endpoint as a WebSocket.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const meetingId = searchParams.get('meetingId');
  const userId = searchParams.get('userId');

  if (!meetingId || !userId) {
    return NextResponse.json({ error: 'Meeting ID and User ID are required' }, { status: 400 });
  }

  // In a real WebSocket server, you would perform an upgrade here.
  // This `GET` request is a placeholder for the initial handshake.
  // The actual WebSocket communication would happen over a persistent connection.

  // Simulate Deepgram Live Client (conceptual)
  // In a real scenario, this live client would receive audio data from the incoming WebSocket
  // connection established with the Chrome extension.
  const liveClient = deepgram.listen.live({
    encoding: 'linear16',
    sampleRate: 16000,
    channels: 1,
    punctuate: true,
    interim_results: true,
  } as LiveSchema);

  liveClient.on(LiveTranscriptionEvents.Open, () => {
    console.log('Deepgram WebSocket OPEN (conceptual)');
  });

  liveClient.on(LiveTranscriptionEvents.Close, () => {
    console.log('Deepgram WebSocket CLOSE (conceptual)');
    // Implement reconnection logic if needed
  });

  liveClient.on(LiveTranscriptionEvents.Error, (error) => {
    console.error('Deepgram WebSocket ERROR (conceptual):', error);
    // Send error back to client if WebSocket is still open
  });

  let transcriptBuffer: string[] = [];
  let lastSaveTime = Date.now();
  const bufferSaveInterval = 3000; // Save every 3 seconds

  liveClient.on(LiveTranscriptionEvents.Transcript, async (data) => {
    const transcriptText = data.channel.alternatives[0]?.transcript;
    const timestamp_ms = data.start * 1000;

    if (transcriptText && transcriptText.trim() !== '') {
      transcriptBuffer.push(transcriptText);

      if (Date.now() - lastSaveTime > bufferSaveInterval || data.is_final) {
        const fullTranscriptChunk = transcriptBuffer.join(' ');
        if (fullTranscriptChunk.trim() !== '') {
          await supabaseServiceRole.from('transcripts').insert({
            meeting_id: meetingId,
            timestamp_ms: timestamp_ms,
            text_chunk: fullTranscriptChunk,
          });
          console.log(`Saved transcript to Supabase for meeting ${meetingId}: ${fullTranscriptChunk}`);
        }
        transcriptBuffer = [];
        lastSaveTime = Date.now();
      }
    }
    // In a real WebSocket setup, you would send this transcript back to the connected client (extension)
    // ws.send(JSON.stringify({ type: 'transcript', data: transcriptText }));
    console.log('Deepgram Transcript (conceptual):', transcriptText);
  });

  // This endpoint needs to be upgraded to a WebSocket connection.
  // In a Vercel deployment with Next.js Edge runtime, this typically requires
  // an external WebSocket service or a custom Node.js server.
  // For local development, you might run a separate Node.js server for WebSockets.

  // For now, we return a response indicating a successful conceptual setup,
  // but actual WebSocket data transfer would occur over the upgraded connection.
  return new Response(null, { status: 101, statusText: "Switching Protocols" });
}

export const config = {
  runtime: 'edge',
};
