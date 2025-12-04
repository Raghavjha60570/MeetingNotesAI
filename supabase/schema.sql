-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE meeting_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE meeting_platform AS ENUM ('zoom', 'google_meet', 'manual_upload');
CREATE TYPE transcript_status AS ENUM ('processing', 'completed', 'failed');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meetings table
CREATE TABLE meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    platform meeting_platform NOT NULL,
    meeting_url TEXT,
    meeting_id TEXT, -- Zoom meeting ID or Google Meet code
    status meeting_status DEFAULT 'scheduled',
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTERVAL,
    participant_count INTEGER DEFAULT 0,
    audio_file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting participants
CREATE TABLE meeting_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'participant', -- host, participant, etc.
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transcript chunks (real-time transcription)
CREATE TABLE transcript_chunks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
    speaker_name TEXT,
    speaker_id TEXT,
    start_time INTERVAL NOT NULL,
    end_time INTERVAL NOT NULL,
    text TEXT NOT NULL,
    confidence DECIMAL(3,2),
    status transcript_status DEFAULT 'processing',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI summaries and analysis
CREATE TABLE ai_summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
    summary_type TEXT NOT NULL, -- 'full_summary', 'key_points', 'action_items', 'highlights'
    content TEXT NOT NULL,
    metadata JSONB, -- Store additional AI-generated data like timestamps, categories, etc.
    model_used TEXT, -- Which AI model generated this
    processing_time INTERVAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audio processing queue
CREATE TABLE audio_processing_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
    audio_chunk_url TEXT NOT NULL,
    status transcript_status DEFAULT 'processing',
    priority INTEGER DEFAULT 0,
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_processing_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Meetings policies
CREATE POLICY "Users can view own meetings" ON meetings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own meetings" ON meetings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meetings" ON meetings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meetings" ON meetings
    FOR DELETE USING (auth.uid() = user_id);

-- Meeting participants policies
CREATE POLICY "Users can view participants of own meetings" ON meeting_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meetings
            WHERE meetings.id = meeting_participants.meeting_id
            AND meetings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage participants of own meetings" ON meeting_participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meetings
            WHERE meetings.id = meeting_participants.meeting_id
            AND meetings.user_id = auth.uid()
        )
    );

-- Transcript chunks policies
CREATE POLICY "Users can view transcripts of own meetings" ON transcript_chunks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meetings
            WHERE meetings.id = transcript_chunks.meeting_id
            AND meetings.user_id = auth.uid()
        )
    );

-- AI summaries policies
CREATE POLICY "Users can view summaries of own meetings" ON ai_summaries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meetings
            WHERE meetings.id = ai_summaries.meeting_id
            AND meetings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create summaries for own meetings" ON ai_summaries
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM meetings
            WHERE meetings.id = ai_summaries.meeting_id
            AND meetings.user_id = auth.uid()
        )
    );

-- Audio processing queue policies
CREATE POLICY "Users can view processing queue of own meetings" ON audio_processing_queue
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meetings
            WHERE meetings.id = audio_processing_queue.meeting_id
            AND meetings.user_id = auth.uid()
        )
    );

-- Create indexes for performance
CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_start_time ON meetings(start_time);
CREATE INDEX idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX idx_transcript_chunks_meeting_id ON transcript_chunks(meeting_id);
CREATE INDEX idx_transcript_chunks_start_time ON transcript_chunks(start_time);
CREATE INDEX idx_ai_summaries_meeting_id ON ai_summaries(meeting_id);
CREATE INDEX idx_ai_summaries_type ON ai_summaries(summary_type);
CREATE INDEX idx_audio_processing_queue_meeting_id ON audio_processing_queue(meeting_id);
CREATE INDEX idx_audio_processing_queue_status ON audio_processing_queue(status);

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_summaries_updated_at BEFORE UPDATE ON ai_summaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audio_processing_queue_updated_at BEFORE UPDATE ON audio_processing_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
