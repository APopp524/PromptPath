/**
 * OpenAI API client for AI-generated summaries
 */

interface GenerateSummaryParams {
  sessionsCount: number;
  avgTimeSaved: number;
  learningDensity: number;
  acceptRatio: number;
  topTask: string | null;
  topTool: string | null;
  sessionSummaries: string[];
}

/**
 * Generate AI summary using OpenAI-compatible API
 */
export async function generateWeeklySummary(
  params: GenerateSummaryParams
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const sessionNotes = params.sessionSummaries.length > 0
    ? params.sessionSummaries.map(s => `- ${s}`).join('\n')
    : 'No session notes available.';

  const prompt = `You are a reflective engineering coach.

Given the following summary of a developer's AI usage this week, write a short, thoughtful reflection.

Guidelines:
- Do not praise or scold.
- Do not invent facts.
- Base insights strictly on the provided data.
- Focus on patterns, tradeoffs, and learning signals.
- Use neutral, supportive language.
- Avoid buzzwords.

Weekly data:
- Sessions logged: ${params.sessionsCount}
- Avg time saved: ${params.avgTimeSaved} minutes
- Learning density: ${params.learningDensity}%
- Accept vs modify ratio: ${params.acceptRatio}%
- Most common task: ${params.topTask || 'N/A'}
- Most used tool: ${params.topTool || 'N/A'}

Session notes:
${sessionNotes}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a reflective engineering coach. Write concise, neutral reflections based on data.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error('No summary generated from API');
    }

    return summary;
  } catch (error) {
    console.error('Error generating AI summary:', error);
    throw error;
  }
}

