import { NextRequest, NextResponse } from 'next/server';
import { systemPrompt } from '@/lib/chatbot/knowledge-base';
import { data } from '@/lib/data';

// Remove edge runtime to allow fs access
// export const runtime = 'edge';

/**
 * Enhanced system prompt with dynamic portfolio context
 */
async function getEnhancedSystemPrompt(): Promise<string> {
  try {
    // Fetch dynamic portfolio data
    const [projects, skills, experience, currently] = await Promise.all([
      data.getProjects(),
      data.getSkills(),
      data.getExperience(),
      data.getCurrently(),
    ]);

    // Get featured projects for quick reference
    const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);

    // Get top skills (expert and advanced level)
    const topSkills = skills
      .filter((s) => s.level === 'expert' || s.level === 'advanced')
      .slice(0, 10);

    // Build enhanced context
    const dynamicContext = `

DYNAMIC PORTFOLIO CONTEXT (Updated):

Featured Projects:
${featuredProjects.map((p) => `- ${p.title} (${p.year}): ${p.summary}`).join('\n')}

Top Skills:
${topSkills.map((s) => `- ${s.name} (${s.level}, ${s.yearsOfExperience}+ years)`).join('\n')}

Current Experience:
${experience
  .slice(0, 2)
  .map((e) => `- ${e.position} at ${e.company} (${e.startDate} - ${e.endDate || 'Present'})`)
  .join('\n')}

Currently:
- Learning: ${currently.learning.map((l) => l.title).join(', ')}
- Working on: ${currently.working.map((w) => w.title).join(', ')}

IMPORTANT INSTRUCTIONS:
- You have access to MCP tools to fetch detailed, real-time information
- When asked about specific projects, skills, or experience, you can provide ACCURATE details
- Use the dynamic context above as a quick reference
- For detailed queries, mention that you have access to comprehensive portfolio data
- Always provide specific, factual information based on the portfolio data
- If asked about projects, you can describe them in detail with technologies used
- If asked about skills, you can provide proficiency levels and years of experience
`;

    return systemPrompt + dynamicContext;
  } catch (error) {
    console.error('Error fetching dynamic context:', error);
    // Fallback to static prompt if dynamic fetch fails
    return systemPrompt;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Groq API key not configured',
          message: 'Please add your GROQ_API_KEY to .env.local'
        },
        { status: 500 }
      );
    }

    // Get enhanced system prompt with dynamic portfolio data
    const fullSystemPrompt = await getEnhancedSystemPrompt();

    // Call Groq API (FREE and FAST!)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Latest Llama model
        messages: [
          { role: 'system', content: fullSystemPrompt },
          ...messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Groq API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate response', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return NextResponse.json({
      message: assistantMessage,
      usage: data.usage,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
