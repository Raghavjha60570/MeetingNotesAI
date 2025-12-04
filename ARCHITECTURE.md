# System Architecture - Live Meeting Notes

## Overview

Live Meeting Notes is a comprehensive SaaS platform for AI-powered meeting transcription and analysis. The system captures audio from meetings, transcribes it in real-time, and generates intelligent summaries using advanced AI models.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Client Layer                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   Web Browser   │  │  Zoom/Google   │  │   File Upload   │             │
│  │   (Dashboard)   │  │   Meet Bot      │  │   Interface     │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Application Layer                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   Next.js API   │  │   WebSocket     │  │   Auth Service  │             │
│  │   Routes        │  │   Server        │  │   (Supabase)    │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Service Layer                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   OpenAI        │  │   Supabase      │  │   File Storage  │             │
│  │   (Whisper/GPT) │  │   Database      │  │   (Supabase)    │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Detailed Component Architecture

### 1. Client Layer

#### Web Dashboard
- **Technology**: Next.js 14 with React 18
- **Features**:
  - Meeting management interface
  - Real-time transcript display
  - AI summary viewer
  - File upload interface
  - User authentication

#### Meeting Bots
- **Zoom Integration**: SDK-based bot for joining meetings
- **Google Meet Integration**: WebRTC-based connection
- **Fallback**: Local microphone capture for development

#### File Upload
- **Supported Formats**: MP3, WAV, M4A, WebM, OGG
- **Size Limit**: 100MB per file
- **Processing**: Asynchronous background processing

### 2. Application Layer

#### API Routes (Next.js)
```
api/
├── meetings/
│   ├── create/          # POST - Create new meeting
│   ├── end/            # POST - End meeting
│   └── generate-summary/# POST - Generate AI summaries
├── transcript/
│   ├── stream/         # WebSocket - Real-time transcription
│   └── upload/         # POST - Upload audio files
└── auth/               # Supabase auth callbacks
```

#### WebSocket Server
- **Purpose**: Real-time audio streaming
- **Protocol**: WebSocket with binary audio data
- **Chunking**: 3-second audio segments
- **Fallback**: Server-Sent Events for compatibility

#### Authentication Service
- **Provider**: Supabase Auth
- **Methods**: Email/password, OAuth
- **Session Management**: JWT tokens with refresh

### 3. Service Layer

#### AI Services (OpenAI)
- **Whisper v3 Large**: Audio transcription
- **GPT-4**: Summary generation and analysis
- **Features**:
  - Speaker diarization
  - Timestamp generation
  - Multi-language support

#### Database (Supabase PostgreSQL)
- **Schema**: Relational with Row Level Security
- **Tables**: users, meetings, transcripts, summaries
- **Real-time**: Live updates for collaborative features

#### File Storage (Supabase Storage)
- **Buckets**: audio-files (public), temp-processing (private)
- **CDN**: Global content delivery
- **Security**: Signed URLs for private files

## Data Flow Diagrams

### Real-Time Meeting Flow

```
1. User starts meeting
       ↓
2. Browser requests mic access
       ↓
3. WebSocket connection established
       ↓
4. Audio stream begins
       ↓
5. Audio chunks (3s) sent to server
       ↓
6. OpenAI Whisper transcribes chunk
       ↓
7. Transcript saved to database
       ↓
8. Real-time update sent to client
       ↓
9. User sees live transcription
```

### File Upload Flow

```
1. User selects audio file
       ↓
2. File uploaded to Supabase Storage
       ↓
3. Processing job queued
       ↓
4. OpenAI Whisper transcribes full file
       ↓
5. Transcript chunks saved
       ↓
6. GPT-4 generates summaries
       ↓
7. Results stored in database
       ↓
8. User notified of completion
```

### AI Summary Generation Flow

```
1. Meeting ends or upload completes
       ↓
2. All transcript chunks retrieved
       ↓
3. Text combined and cleaned
       ↓
4. GPT-4 prompted for analysis
       ↓
5. Multiple summary types generated:
   ├── Full Summary
   ├── Key Points
   ├── Action Items
   └── Highlights
       ↓
6. Results stored with metadata
       ↓
7. Available in dashboard
```

## Database Schema Design

### Entity Relationship Diagram

```
users (1) ──── (∞) meetings (1) ──── (∞) meeting_participants
    │                    │
    │                    ├── (∞) transcript_chunks
    │                    │
    │                    └── (∞) ai_summaries
    │
    └── authentication data (email, password hash)
```

### Core Tables

#### users
- **Purpose**: User profiles and authentication
- **Key Fields**: id, email, full_name, avatar_url
- **Relationships**: One-to-many with meetings

#### meetings
- **Purpose**: Meeting records and metadata
- **Key Fields**: id, user_id, title, platform, status, start_time, end_time
- **Relationships**: Many-to-one with users, one-to-many with transcripts/summaries

#### transcript_chunks
- **Purpose**: Real-time transcription segments
- **Key Fields**: id, meeting_id, text, start_time, end_time, speaker_name
- **Relationships**: Many-to-one with meetings

#### ai_summaries
- **Purpose**: AI-generated analysis and summaries
- **Key Fields**: id, meeting_id, summary_type, content, model_used
- **Relationships**: Many-to-one with meetings

#### audio_processing_queue
- **Purpose**: Background processing jobs
- **Key Fields**: id, meeting_id, audio_chunk_url, status, priority
- **Relationships**: Many-to-one with meetings

## Security Architecture

### Authentication & Authorization
- **JWT-based**: Supabase handles token generation/validation
- **Row Level Security**: Database policies enforce data isolation
- **Session Management**: Automatic token refresh

### Data Protection
- **Encryption**: Data encrypted at rest and in transit
- **Access Control**: Users can only access their own data
- **API Security**: Input validation and rate limiting

### Network Security
- **HTTPS Only**: All communications encrypted
- **CORS Policy**: Restricted to allowed domains
- **API Keys**: Securely stored server-side only

## Scalability Considerations

### Horizontal Scaling
- **Stateless API**: Easy to scale horizontally
- **Database**: Supabase handles connection pooling
- **Storage**: CDN-backed global distribution

### Performance Optimization
- **Caching**: API responses and static assets
- **Background Processing**: AI tasks run asynchronously
- **Database Indexing**: Optimized queries for common operations

### Monitoring & Observability
- **Error Tracking**: Comprehensive logging
- **Performance Metrics**: Response times and throughput
- **Usage Analytics**: API usage and user behavior

## Deployment Architecture

### Production Setup (Recommended)

```
┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Supabase      │
│   (Frontend)    │◄──►│   (Backend)     │
│                 │    │                 │
│ - Next.js App   │    │ - Database      │
│ - API Routes    │    │ - Auth          │
│ - CDN           │    │ - Storage       │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
                 │
        ┌─────────────────┐
        │   OpenAI API    │
        │   (External)    │
        └─────────────────┘
```

### Alternative Deployments

#### Docker-based
- Containerized application
- Easy scaling with orchestration
- Self-hosted option

#### Serverless
- Vercel for frontend/API
- Supabase for data
- OpenAI for AI processing

## Technology Choices Rationale

### Next.js
- **Full-stack**: API routes eliminate separate backend
- **SSR/SSG**: Better SEO and performance
- **TypeScript**: Type safety and better DX
- **Vercel Integration**: Seamless deployment

### Supabase
- **PostgreSQL**: Robust relational database
- **Real-time**: Live updates capability
- **Auth**: Complete authentication solution
- **Storage**: File storage with CDN

### OpenAI
- **Whisper**: Industry-leading transcription accuracy
- **GPT-4**: Advanced language understanding
- **API**: Simple integration and scaling

### WebSockets
- **Real-time**: Low-latency audio streaming
- **Bidirectional**: Server can push updates
- **Efficient**: Better than polling for real-time features

## Future Architecture Extensions

### Advanced Features
- **Speaker Diarization**: Identify different speakers
- **Multi-language**: Support for multiple languages
- **Video Analysis**: Process video content
- **Integration APIs**: Connect with calendar/meeting apps

### Scalability Improvements
- **Edge Functions**: Global processing closer to users
- **Microservices**: Separate services for different functions
- **Queue System**: Advanced background job processing

### Enhanced AI Capabilities
- **Custom Models**: Fine-tuned models for domain-specific content
- **Real-time Analysis**: Live sentiment analysis
- **Collaborative Editing**: Multiple users editing summaries

---

This architecture provides a solid foundation for a scalable, secure, and feature-rich AI-powered meeting transcription platform.
