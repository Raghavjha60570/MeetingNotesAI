-- Enable Row Level Security
-- Note: ALTER DATABASE command removed as it requires superuser privileges in Supabase

-- Create custom types
CREATE TYPE meeting_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE meeting_platform AS ENUM ('zoom', 'google_meet', 'manual_upload');
CREATE TYPE transcript_status AS ENUM ('processing', 'completed', 'failed');

-- Create users table
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    email text UNIQUE NOT NULL,
    created_at timestamp WITH TIME ZONE DEFAULT NOW()
);

-- Create meetings table
CREATE TABLE meetings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    title text,
    started_at timestamp WITH TIME ZONE DEFAULT NOW(),
    ended_at timestamp WITH TIME ZONE,
    summary text
);

-- Create transcripts table
CREATE TABLE transcripts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
    timestamp_ms BIGINT NOT NULL,
    text_chunk text NOT NULL
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for meetings table
CREATE POLICY "Users can view their own meetings" ON meetings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create meetings" ON meetings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own meetings" ON meetings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own meetings" ON meetings FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for transcripts table
CREATE POLICY "Users can view transcripts of their own meetings" ON transcripts FOR SELECT USING (EXISTS (SELECT 1 FROM meetings WHERE meetings.id = meeting_id AND meetings.user_id = auth.uid()));
CREATE POLICY "Users can insert transcripts for their own meetings" ON transcripts FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM meetings WHERE meetings.id = meeting_id AND meetings.user_id = auth.uid()));
CREATE POLICY "Users can update transcripts for their own meetings" ON transcripts FOR UPDATE USING (EXISTS (SELECT 1 FROM meetings WHERE meetings.id = meeting_id AND meetings.user_id = auth.uid()));
CREATE POLICY "Users can delete transcripts for their own meetings" ON transcripts FOR DELETE USING (EXISTS (SELECT 1 FROM meetings WHERE meetings.id = meeting_id AND meetings.user_id = auth.uid()));
