# Live Meeting Notes Application

This project aims to build a comprehensive web application and Chrome extension to automatically detect, record, transcribe, summarize, and manage Google Meet calls, similar to tl;dv.

## Tech Stack

**Frontend:** Next.js 15 (App Router), TypeScript, TailwindCSS, ShadCN UI, Zustand
**Backend:** Supabase (Database + Auth + Functions), Deepgram (Real-time transcription), OpenAI (Summarization), WebSockets
**Chrome Extension:** Manifest V3, React, TailwindCSS

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root of the `live-meeting-notes` directory and populate it with the following:

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

DEEPGRAM_API_KEY=YOUR_DEEPGRAM_API_KEY
OPENAI_API_KEY=YOUR_OPENAI_API_KEY

EXTENSION_ID=YOUR_CHROME_EXTENSION_ID # This will be generated after loading the extension
```

**How to obtain these keys:**

*   **Supabase Project URL, Anon Key, Service Role Key:**
    1.  Go to [Supabase](https://supabase.com/) and create a new project.
    2.  Navigate to "Settings" -> "API" in your Supabase project dashboard.
    3.  You will find your Project URL, `anon` public key, and `service_role` secret key there.

*   **Deepgram API Key:**
    1.  Go to [Deepgram](https://deepgram.com/) and sign up or log in.
    2.  Navigate to "API Keys" in your Deepgram console.
    3.  Create a new API key.

*   **OpenAI API Key:**
    1.  Go to [OpenAI](https://openai.com/) and sign up or log in.
    2.  Navigate to "API keys" in your OpenAI dashboard.
    3.  Create a new secret key.

### 2. Install Dependencies

Navigate to the `live-meeting-notes` directory and install the dependencies:

```bash
npm install
```

### 3. Run the Next.js Application

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### 4. Supabase Database Setup

Follow the instructions in `supabase/schema.sql` to set up your database tables and RLS policies. You can use the Supabase UI or the Supabase CLI to run the SQL.

### 5. Chrome Extension

#### Loading the Unpacked Extension

1.  Open Google Chrome.
2.  Go to `chrome://extensions/`.
3.  Enable "Developer mode" (toggle switch in the top right).
4.  Click "Load unpacked" and select the `live-meeting-notes/chrome-extension` directory.
5.  After loading, an "Extension ID" will be generated for your extension. Copy this ID and paste it into the `EXTENSION_ID` environment variable in your `.env.local` file.

#### Testing on Google Meet

1.  Start your Next.js application (`npm run dev`).
2.  Open a Google Meet call (`https://meet.google.com/*`).
3.  The content script will inject "Start Recording", "Stop Recording", and "View Dashboard" buttons into the Google Meet interface.
4.  Use these buttons to control the recording and view your meeting dashboard.

#### Content Script Interaction with Backend

The Chrome extension's content script communicates with the background service worker, which then establishes a WebSocket connection to the `/api/transcribe` endpoint of your Next.js backend. This allows real-time streaming of audio for transcription.

## Deployment

### Vercel (Next.js Application)

1.  Push your code to a Git repository (e.g., GitHub, GitLab, Bitbucket).
2.  Go to [Vercel](https://vercel.com/) and import your project.
3.  During the setup, ensure you configure the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DEEPGRAM_API_KEY`, `OPENAI_API_KEY`) as "Environment Variables" in your Vercel project settings.

### Chrome Web Store (Extension)

To deploy the Chrome extension to the Chrome Web Store, you will need to:

1.  Create a developer account.
2.  Package your extension.
3.  Upload it to the developer dashboard.

Refer to the official Chrome Developers documentation for detailed instructions on [publishing your extension](https://developer.chrome.com/docs/webstore/publish/).

## Testing

Comprehensive end-to-end, unit, and integration tests will be developed to ensure the reliability and functionality of the application and extension. This includes simulating Google Meet environments and robust error handling tests.
