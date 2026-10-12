# AI assistant (chatbot)

The assistant answers visitors' questions about Liron, speaking as him, from the
real portfolio data. It runs on **Groq** (free tier) with function calling: the
model pulls projects, skills and experience through the same tools the MCP server
exposes (`lib/mcp/`).

## Request flow

```
ChatBot.tsx ──POST /api/chat {messages}──▶ app/api/chat/route.ts
                                              │
          system prompt (knowledge-base.ts) + project slugs + trimmed history
                                              │
                         round 1 ── Groq, streamed, tools offered
                            │ tool calls? ──▶ lib/mcp/registry.ts callTool()
                         round 2 ── Groq, streamed, tools offered
                            │ tool calls? ──▶ callTool()
                         round 3 ── Groq, streamed, no tools: must answer
                                              │
◀── NDJSON events: tools · text… · projects · followups  (or error)
```

A question that needs no tool costs **one** Groq call, streamed from the first
token. Most tool questions cost two.

### Stream events

| `type`      | payload                         | when                                  |
| ----------- | ------------------------------- | ------------------------------------- |
| `tools`     | `names: string[]`               | after a tool round                    |
| `text`      | `value: string`                 | answer tokens, as they arrive         |
| `projects`  | `items: ChatProject[]`          | end - projects the answer names       |
| `followups` | `items: string[]`               | end - suggested next questions        |
| `error`     | `value: string`, `code`         | `quota`, `empty` or `failed`          |

Quota and configuration problems on the first round come back as a plain HTTP
error (`429` / `500`) with `{ error }` instead of a stream.

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
- Every request logs one line: model, rounds, tools, tokens, remaining budget.

## Where facts live

- `knowledge-base.ts` - identity, current role, education, rules. Re-sent on every
  request, so keep it small; anything detailed belongs in `data/` or `content/`.
- `data/*.json`, `content/projects/*.mdx` - read through the tools.
  `get_project_details` includes a digest of the MDX body (prose only, challenges
  and lessons first, roadmap sections skipped).
- `suggested-questions.ts` - chips under the hero bar and in the empty panel.

## Testing

With the dev server running (`npm run dev`):

```bash
npm run eval:chat                            # everything (~8 min, paced for the quota)
npm run eval:chat -- --group=conversations   # multi-turn conversations only
npm run eval:chat -- --only=email,career-thread
```

`scripts/chatbot-eval-cases.mjs` holds the cases: single-turn facts, prompt
injection, and multi-turn conversations where every turn carries the assistant's
real previous answers, like the panel does.
