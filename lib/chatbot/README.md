# AI Chatbot - Personal Assistant

This chatbot acts as Liron's AI assistant, answering questions about his experience, projects, skills, and background.

## Features

- **RAG System**: Retrieves relevant information from portfolio data
- **Context-Aware**: Understands what information is relevant to each question
- **Multi-lingual**: Can respond in French, English, and Hebrew
- **Real-time**: Instant responses powered by OpenAI GPT-4
- **Persistent UI**: Floating chat widget accessible from any page

## Setup

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key

### 2. Configure Environment

Add your OpenAI API key to `.env.local`:

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. Install Dependencies

The chatbot uses:
- `langchain` - For AI orchestration
- `@langchain/openai` - OpenAI integration
- `ai` - Vercel AI SDK (optional, for streaming)

Dependencies are already installed via npm.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ChatBot UI Component                  │
│                   (components/ChatBot.tsx)               │
└───────────────────┬─────────────────────────────────────┘
                    │ Sends messages
                    ▼
┌─────────────────────────────────────────────────────────┐
│                  API Route (/api/chat)                   │
│                 (app/api/chat/route.ts)                  │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┴──────────┐
        ▼                      ▼
┌──────────────────┐  ┌────────────────────┐
│  Knowledge Base  │  │  Portfolio Context │
│                  │  │                    │
│ - Personal Info  │  │ - Projects         │
│ - Expertise      │  │ - Experience       │
│ - Personality    │  │ - Skills           │
│ - Guidelines     │  │ - Certificates     │
└──────────────────┘  └────────────────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │    OpenAI GPT-4      │
        │  (gpt-4o-mini)       │
        └──────────────────────┘
                    │
                    ▼
                Response
```

## Files Structure

```
lib/chatbot/
├── knowledge-base.ts          # Static personal information and system prompt
├── portfolio-context.ts       # Dynamic portfolio data loader
├── suggested-questions.ts     # Quick reply suggestions
└── README.md                  # This file

app/api/chat/
└── route.ts                   # Chat API endpoint

components/
└── ChatBot.tsx                # Chat UI component
```

## How It Works

### 1. User Asks Question

User types a question in the chat UI.

### 2. Context Retrieval

The API route:
- Analyzes the question to determine relevant context
- Fetches matching data from portfolio (projects, skills, etc.)
- Combines with static knowledge base

### 3. AI Processing

- Sends question + context to OpenAI GPT-4
- Uses system prompt to ensure AI responds as Liron
- Temperature set to 0.7 for natural but consistent responses

### 4. Response Display

- AI response is sent back to UI
- Displayed in chat interface
- Conversation history maintained

## Customization

### Modify Personality

Edit `lib/chatbot/knowledge-base.ts`:

```typescript
export const personalInfo = {
  // Update bio, personality traits, fun facts
};
```

### Change AI Model

Edit `app/api/chat/route.ts`:

```typescript
model: 'gpt-4o-mini', // Change to 'gpt-4' for better quality
temperature: 0.7,      // Adjust for creativity (0.0-1.0)
max_tokens: 500,       // Increase for longer responses
```

### Add More Context

Edit `lib/chatbot/portfolio-context.ts` to include additional data sources.

### Update Suggested Questions

Edit `lib/chatbot/suggested-questions.ts`:

```typescript
export const quickReplies = [
  "Your custom questions here",
];
```

## Cost Optimization

The chatbot uses `gpt-4o-mini` for cost efficiency:

- ~$0.00015 per 1K input tokens
- ~$0.0006 per 1K output tokens
- Average query: $0.001-0.002

For production with high traffic, consider:
- Implementing response caching
- Rate limiting
- Using smaller models for simple questions
- Implementing a free tier limit

## Deployment

### Vercel (Recommended)

The chatbot works automatically on Vercel:

1. Add `OPENAI_API_KEY` to Vercel environment variables
2. Deploy: `vercel --prod`

The API route runs on Vercel Edge Runtime for fast responses.

### Alternative Platforms

For Railway, Render, or other platforms:
- Ensure Node.js 18+ is available
- Set environment variables
- The API route will run as serverless function

## Testing

Test the chatbot with various questions:

```
✅ "Who are you?"
✅ "What technologies do you use?"
✅ "Tell me about your projects"
✅ "What's your experience with Python?"
✅ "How can I contact you?"
✅ "Can you work in French?"
```

## Troubleshooting

### "OpenAI API key not configured"

- Check `.env.local` has `OPENAI_API_KEY`
- Restart dev server after adding env var

### No response from chatbot

- Check browser console for errors
- Verify API key is valid
- Check OpenAI API status

### Incorrect information

- Update `knowledge-base.ts` with correct info
- Ensure portfolio data is up to date
- Adjust system prompt for better guidance

## Future Enhancements

Potential improvements:

- [ ] Add LangGraph for multi-step reasoning
- [ ] Implement conversation memory with Redis
- [ ] Add voice input/output
- [ ] Multilingual UI (not just responses)
- [ ] Analytics dashboard for questions asked
- [ ] Fine-tuned model specifically on Liron's data
- [ ] Integrate with calendar for availability
- [ ] Email follow-up capability

## Privacy & Security

- No user data is stored
- Conversations are not logged
- OpenAI API calls follow their privacy policy
- Consider adding rate limiting for production
