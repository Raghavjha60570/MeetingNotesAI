import OpenAI from 'openai';

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  throw new Error('Missing OpenAI API Key');
}

export const openai = new OpenAI({
  apiKey: openaiApiKey,
});
