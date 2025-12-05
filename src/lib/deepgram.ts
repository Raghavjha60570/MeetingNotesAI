import { createClient as createDeepgramClient } from '@deepgram/sdk';

const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

if (!deepgramApiKey) {
  throw new Error('Missing Deepgram API Key');
}

export const deepgram = createDeepgramClient(deepgramApiKey);
