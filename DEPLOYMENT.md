# Deployment Guide - Live Meeting Notes

This guide covers deploying the Live Meeting Notes application to production.

## Quick Deployment (Vercel + Supabase)

### Prerequisites
- Vercel account
- Supabase project
- OpenAI API key

### Steps

1. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Set Environment Variables in Vercel**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   OPENAI_API_KEY=your-openai-api-key
   NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
   ```

3. **Configure Supabase**
   - Enable Row Level Security
   - Run the schema from `supabase/schema.sql`
   - Create storage bucket: `audio-files` (set to public)
   - Configure CORS to allow your Vercel domain

4. **Update Authentication URLs**
   - In Supabase Dashboard → Authentication → Settings
   - Add your Vercel domain to "Site URL"
   - Add redirect URLs for auth callbacks

## Production Architecture

### Recommended Setup
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Supabase      │    │   OpenAI API    │
│   (Frontend)    │◄──►│   (Database)    │◄──►│   (AI Models)   │
│                 │    │                 │    │                 │
│ - Next.js App   │    │ - PostgreSQL    │    │ - Whisper       │
│ - API Routes    │    │ - Auth          │    │ - GPT-4         │
│ - WebSocket *   │    │ - Storage       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```
*WebSocket support may require additional configuration

### Scaling Considerations
- Use Supabase Edge Functions for heavy AI processing
- Implement Redis for session management if needed
- Consider CDN for static assets
- Monitor OpenAI API usage and costs

## Alternative Deployments

### Docker Deployment

1. **Build Docker image**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Run with Docker Compose**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
         - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
         - OPENAI_API_KEY=${OPENAI_API_KEY}
   ```

### Railway Deployment

1. **Connect GitHub repository**
2. **Set environment variables**
3. **Deploy automatically on push**

### Self-Hosted Server

1. **Server Requirements**
   - Node.js 18+
   - PostgreSQL 15+
   - Redis (optional, for sessions)
   - SSL certificate (Let's Encrypt)

2. **Production Setup**
   ```bash
   # Install dependencies
   npm ci --production

   # Build application
   npm run build

   # Start with PM2
   npm install -g pm2
   pm2 start npm --name "live-meeting-notes" -- start
   pm2 save
   pm2 startup
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## WebSocket Configuration

### Production WebSocket Setup

For production WebSocket support, you'll need a separate WebSocket server:

1. **Create WebSocket server** (`ws-server.js`)
   ```javascript
   const WebSocket = require('ws');
   const wss = new WebSocket.Server({ port: process.env.WEBSOCKET_PORT || 8080 });

   wss.on('connection', (ws) => {
     // Handle WebSocket connections
   });
   ```

2. **Deploy WebSocket server**
   - Use services like Railway, Render, or AWS ECS
   - Configure load balancer for sticky sessions

3. **Update client configuration**
   ```javascript
   const wsUrl = process.env.NODE_ENV === 'production'
     ? 'wss://your-websocket-server.com'
     : 'ws://localhost:8080';
   ```

## Environment Variables

### Required Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Optional Variables
```bash
# WebSocket
WEBSOCKET_PORT=8080
WEBSOCKET_URL=wss://your-websocket-server.com

# Alternative AI services
DEEPGRAM_API_KEY=xxxxx
ASSEMBLY_AI_API_KEY=xxxxx

# Zoom/Google Meet integration (future)
ZOOM_SDK_KEY=xxxxx
GOOGLE_CLIENT_ID=xxxxx
```

## Database Setup

### Supabase Configuration

1. **Create project** at supabase.com

2. **Run schema migration**
   - Copy contents of `supabase/schema.sql`
   - Execute in Supabase SQL Editor

3. **Configure storage**
   - Create bucket: `audio-files`
   - Set to public access
   - Configure CORS for your domain

4. **Set up authentication**
   - Enable email/password auth
   - Configure redirect URLs
   - Set site URL to your domain

### Database Migrations

For schema updates in production:
```sql
-- Example migration
ALTER TABLE meetings ADD COLUMN new_field TEXT;
```

## Monitoring & Analytics

### Recommended Monitoring
- **Vercel Analytics** - Built-in performance monitoring
- **Supabase Dashboard** - Database metrics and logs
- **OpenAI Usage Dashboard** - API usage and costs
- **Custom logging** - Implement structured logging

### Error Tracking
```javascript
// Add to API routes
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

## Security Considerations

### Authentication
- Supabase handles authentication securely
- JWT tokens are validated on each request
- Row Level Security (RLS) enabled on all tables

### API Security
- Environment variables for sensitive data
- Input validation on all endpoints
- Rate limiting (consider implementing)

### Data Privacy
- Audio files encrypted in transit and at rest
- Transcripts and summaries stored securely
- User data isolated by RLS policies

## Performance Optimization

### Frontend Optimizations
- Next.js automatic optimizations
- Image optimization with next/image
- Code splitting and lazy loading
- Service Worker for caching (optional)

### Backend Optimizations
- API response caching
- Database query optimization
- Background job processing for AI tasks
- CDN for static assets

### Database Optimization
- Proper indexing on frequently queried columns
- Connection pooling
- Query performance monitoring

## Cost Optimization

### OpenAI Costs
- Monitor API usage in OpenAI dashboard
- Implement caching for repeated requests
- Consider alternative models for cost savings
- Set up billing alerts

### Supabase Costs
- Monitor database usage
- Optimize storage usage
- Set up billing alerts

### Hosting Costs
- Vercel has generous free tier
- Monitor function execution times
- Optimize bundle size

## Troubleshooting

### Common Issues

**WebSocket connection fails**
- Check WebSocket server is running
- Verify CORS configuration
- Check firewall settings

**Audio upload fails**
- Verify Supabase storage configuration
- Check file size limits
- Validate file formats

**AI processing fails**
- Check OpenAI API key
- Verify API quotas
- Check network connectivity

**Database connection issues**
- Verify Supabase credentials
- Check RLS policies
- Monitor database performance

### Logs and Debugging

**Vercel Logs**
```bash
vercel logs
```

**Supabase Logs**
- Access via Supabase Dashboard
- Check API logs and database logs

**Custom Logging**
```javascript
console.log('Debug info:', { userId, meetingId, error })
```

## Backup & Recovery

### Database Backups
- Supabase provides automatic backups
- Export important data regularly
- Test backup restoration

### File Storage
- Supabase Storage durability
- Consider backup strategy for audio files
- Implement retention policies

## Support & Maintenance

### Regular Tasks
- Monitor error rates and performance
- Update dependencies regularly
- Review and optimize costs
- Backup critical data

### Getting Help
- Check Vercel status page
- Review Supabase documentation
- OpenAI API status and documentation
- Create GitHub issues for bugs

---

For additional help, refer to the main README.md or create an issue on GitHub.
