import { google } from '@ai-sdk/google';
import { streamText, embed } from 'ai';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1].content;

    // Generate embedding for the user query
    const { embedding } = await embed({
      model: google.textEmbeddingModel('text-embedding-004'),
      value: latestMessage,
    });

    const supabase = await createClient();

    // Query the database for similar context
    const { data: documents, error } = await supabase.rpc('match_portfolio_documents', {
      query_embedding: embedding,
      match_threshold: 0.7, // Adjust as needed
      match_count: 5,
    });

    if (error) {
      console.error('Error querying database:', error);
      throw new Error('Database query failed');
    }

    // Build context string from matched documents
    let context = '';
    if (documents && documents.length > 0) {
      context = documents.map((doc: any) => {
        return `[Source: ${doc.metadata?.title || doc.source_type}] (${doc.metadata?.url || 'N/A'})\n${doc.content}\n`;
      }).join('\n');
    }

    // Prepare system prompt with context
    const systemPrompt = `You are a helpful AI assistant for a developer's portfolio website.
Your goal is to answer questions about the developer based ONLY on the provided context below.
If you don't know the answer or the context doesn't contain the information, say so gracefully.
Be concise, professional, and friendly.
Always include citations to the source URLs when you use information from the context. (e.g. "According to their [Project Name](/projects/project-slug)...")

Context:
${context || 'No relevant context found.'}`;

    // Stream the response back
    const result = streamText({
      model: google('gemini-1.5-flash'),
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
