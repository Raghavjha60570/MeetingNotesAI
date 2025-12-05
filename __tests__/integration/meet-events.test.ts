import { createClient } from '@supabase/supabase-js';
import { POST as handleMeetEvent } from '../../src/app/api/meet-events/route';
import { NextRequest } from 'next/server';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({ data: [{ id: 'test-meeting-id', user_id: 'test-user-id', title: 'Test Meeting', started_at: new Date().toISOString() }], error: null })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({ select: jest.fn(() => ({ data: [{ id: 'test-meeting-id', user_id: 'test-user-id', ended_at: new Date().toISOString() }], error: null })) })),
        })),
      })),
    })),
  })),
}));

describe('Meeting Events API', () => {
  it('should handle meeting_start event', async () => {
    const mockRequest = new NextRequest('http://localhost/api/meet-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'meeting_start', userId: 'test-user-id', title: 'Integration Test Meeting' }),
    });

    const response = await handleMeetEvent(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Meeting started');
    expect(data.meetingId).toBeDefined();
  });

  it('should handle meeting_end event', async () => {
    const mockRequest = new NextRequest('http://localhost/api/meet-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'meeting_end', userId: 'test-user-id', meetingId: 'test-meeting-id' }),
    });

    const response = await handleMeetEvent(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Meeting ended');
  });
});
