# Live Meeting Notes - AI Note Taker

A comprehensive SaaS application for recording meetings, transcribing audio in real-time, and generating AI-powered summaries. Built with Next.js, Supabase, and OpenAI.

## Features

### Core Functionality
- **Real-time Meeting Recording**: Join Zoom or Google Meet meetings with AI bot
- **Live Transcription**: Stream audio to text using OpenAI Whisper
- **AI Summaries**: Generate meeting summaries, action items, and key highlights
- **Dashboard**: Complete web interface for managing meetings
- **File Upload**: Upload existing audio recordings for processing

### Technical Features
- Real-time WebSocket audio streaming
- OpenAI GPT-4 for intelligent summaries
- Supabase for database and authentication
- Responsive web interface with Tailwind CSS
- File upload and processing pipeline

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI Whisper (transcription), GPT-4 (summaries)
- **Real-time**: WebSockets for audio streaming
- **Storage**: Supabase Storage for audio files

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd live-meeting-notes
   npm install
   ```

2. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql`
   - Create storage bucket: `audio-files` (public)
   - Get your project URL and API keys

3. **Configure environment variables**
   ```bash
   cp env-example.txt .env.local
   ```

   Edit `.env.local` with your actual values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   OPENAI_API_KEY=your-openai-api-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Visit `http://localhost:3000`
   - Sign up for an account
   - Start creating meetings!

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── meetings/      # Meeting management
│   │   └── transcript/    # Transcription services
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   │   └── meeting/       # Meeting detail pages
│   ├── upload/            # File upload page
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
├── lib/                   # Utility libraries
│   ├── supabase.ts        # Supabase client
│   ├── auth.ts           # Authentication helpers
│   └── websocket.ts      # WebSocket client
├── types/                 # TypeScript definitions
│   └── database.ts        # Database types
└── utils/                 # Helper functions

supabase/
└── schema.sql            # Database schema
```

## API Endpoints

### Meetings
- `POST /api/meetings/create` - Create new meeting
- `POST /api/meetings/end` - End meeting and trigger summary
- `POST /api/meetings/generate-summary` - Generate AI summaries

### Transcription
- `GET /api/transcript/stream` - WebSocket endpoint for real-time transcription
- `POST /api/transcript/upload` - Upload and transcribe audio files

## Database Schema

### Core Tables
- `users` - User profiles
- `meetings` - Meeting records
- `meeting_participants` - Meeting attendees
- `transcript_chunks` - Transcription segments
- `ai_summaries` - Generated summaries
- `audio_processing_queue` - Background processing

See `supabase/schema.sql` for complete schema definition.

## Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Key Components

#### Real-time Audio Processing
The app uses WebSockets to stream audio from the browser to the server, where it's processed by OpenAI Whisper in real-time.

#### AI Summary Generation
After meetings end, GPT-4 analyzes transcripts to generate:
- Full meeting summaries
- Key points and takeaways
- Action items with assignees
- Important highlights with timestamps

#### File Upload Pipeline
1. User uploads audio file
2. File stored in Supabase Storage
3. OpenAI Whisper transcribes entire file
4. GPT-4 generates summaries
5. Results displayed in dashboard

## Deployment

### Vercel + Supabase (Recommended)

1. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Configure environment variables** in Vercel dashboard

3. **Update Supabase CORS settings** to allow your Vercel domain

### Alternative Deployment Options

See `DEPLOYMENT.md` for detailed deployment instructions including:
- Docker deployment
- WebSocket server setup
- Production WebSocket configuration
- Load balancing considerations

## Architecture

### System Overview
```
Browser Client ↔️ WebSocket Server ↔️ OpenAI Whisper
       ↓              ↓              ↓
   Dashboard UI → API Routes → Supabase Database
              ↓              ↓
       File Upload → GPT-4 Summaries
```

### Data Flow
1. **Live Meeting**: Browser captures audio → WebSocket → OpenAI Whisper → Transcript chunks stored
2. **Meeting End**: Trigger summary generation → GPT-4 analyzes transcript → AI summaries stored
3. **File Upload**: Audio file → OpenAI Whisper → Full transcript → GPT-4 summaries

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support, email support@livemeetingnotes.com or create an issue on GitHub.

---

Built with ❤️ using Next.js, Supabase, and OpenAI
