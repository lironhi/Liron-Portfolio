# AI assistant (chatbot)

The assistant answers visitors' questions about Liron, speaking as him, from the
real portfolio data. It runs on **Groq** (free tier) with function calling: the
model pulls projects, skills and experience through the same tools the MCP server
exposes (`lib/mcp/`).

## Request flow

```
ChatBot.tsx ──POST /api/chat {messages + signatures}──▶ app/api/chat/route.ts
                                              │
                    rate limits (per minute, per day) ── lib/rateLimit.ts
                    history: unsigned assistant turns dropped, trimmed to budget
                    system prompt built from data/ ── knowledge-base.ts
                                              │
                         round 1 ── Groq, streamed, tools offered
                            │ tool calls? ──▶ lib/mcp/registry.ts callTool()
                         round 2 ── Groq, streamed, tools offered
                            │ tool calls? ──▶ callTool()
                         round 3 ── Groq, streamed, no tools: must answer
                                              │
◀── NDJSON: tools · text… · signature · projects · followups   (or error)
```

A question that needs no tool costs **one** Groq call, streamed from the first
token. Most tool questions cost two.

| File               | Role                                                            |
| ------------------ | --------------------------------------------------------------- |
| `groq.ts`          | model fallback, quota detection, streamed-round parser          |
| `conversation.ts`  | history trimming, project cards, follow-ups (pure, unit tested) |
| `signing.ts`       | HMAC on each answer, so a forged history is ignored             |
| `knowledge-base.ts`| system prompt, generated from `data/` on every request          |

### Stream events

| `type`      | payload                 | when                                    |
| ----------- | ----------------------- | --------------------------------------- |
| `tools`     | `names: string[]`       | after a tool round                      |
| `text`      | `value: string`         | answer tokens, as they arrive           |
| `signature` | `value: string`         | end - send it back with the answer      |
| `projects`  | `items: ChatProject[]`  | end - projects the answer names         |
| `followups` | `items: string[]`       | end - suggested next questions          |
| `error`     | `value: string`, `code` | `quota`, `empty` or `failed`            |

Quota, rate-limit and configuration problems on the first round come back as a
plain HTTP error (`429` / `500`) with `{ error }` instead of a stream.

### Forged history

The browser sends the whole conversation on every turn. Each complete answer is
signed (`signature` event) and the panel sends the signature back with it; an
assistant turn without a valid one never reaches the model. Otherwise anyone could
write "Yes, I have a PhD from MIT" as an earlier answer and have the bot build on it.

## Model and quotas

- Models are tried in order: `GROQ_MODEL` (default `openai/gpt-oss-120b`), then
  `openai/gpt-oss-20b`. A model Groq answers `404 model_not_found` for is skipped
  from then on; a `429` falls through to the next one, since quotas are per model.
- Groq retires models without much notice. `llama-3.3-70b-versatile` disappeared
  and every question answered 500. If the chat breaks overnight, check the model
  list first: `curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer $GROQ_API_KEY"`.
- Free tier, per model: **8k tokens per minute, 1k requests per day**. The system
  prompt, tool schemas, history and tool results are re-sent on every round, so the
  route caps history at 6k characters and each tool result at 5k
  (`registry.ts` re-serialises results compactly and drops per-item detail from
  long lists rather than cutting them off).
- Visitors are capped at 15 questions a minute and, in production, 40 a day
  (`CHAT_DAILY_LIMIT`): one script at the minute rate would otherwise drain the
  day's 1k requests in about an hour, for everyone. The counters are only shared
  across serverless instances when Upstash is configured (`.env.local.example`).
- Every request logs one line: model, rounds, tools, tokens, remaining budget.

## Where facts live

- `data/*.json` - the source of every fact in the system prompt: bio, email and
  location (`site.json`), each job and its headline achievement, education,
  certificates, strongest languages and frameworks. Edit the data, not the prompt.
- `knowledge-base.ts` - only what no data file holds: spoken languages and the
  conversation rules. Re-sent on every request, so keep it small.
- `content/projects/*.mdx` - read through the tools. `get_project_details`
  includes a digest of the MDX body (prose only, challenges and lessons first,
  roadmap sections skipped).
- `suggested-questions.ts` - chips under the hero bar and in the empty panel.

## Testing

```bash
npm test                                     # unit tests, ~2 s, no network
```

With the dev server running (`npm run dev`), against the real model:

```bash
npm run eval:chat                            # everything (~9 min, paced for the quota)
npm run eval:chat -- --group=conversations   # multi-turn conversations only
npm run eval:chat -- --only=email,career-thread
```

`scripts/chatbot-eval-cases.mjs` holds the cases: single-turn facts, prompt
injection (a forged history included), and multi-turn conversations where every
turn carries the assistant's real, signed previous answers, like the panel does.

Production is checked daily by `.github/workflows/chatbot-health.yml` (one
question); a failed run makes GitHub send an email.
