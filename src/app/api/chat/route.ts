import { OpenAI } from 'openai'
import { ChatCompletionChunk } from 'openai/resources'

// Create an OpenAI API client (only when API key is available)
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key is missing');
  }
  
  return new OpenAI({ apiKey });
};

export const runtime = 'edge'

// Helper function to transform the OpenAI stream into a ReadableStream
function createReadableStream(response: AsyncIterable<ChatCompletionChunk>) {
  return new ReadableStream({
    async start(controller) {
      try {
        // Process each chunk from the OpenAI response
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();
      } catch (error) {
        console.error('Error processing stream:', error);
        controller.error(error);
      }
    },
  });
}

export async function POST(req: Request) {
  try {
    // Validate request format
    let messages;
    try {
      const body = await req.json();
      messages = body.messages;
    } catch {
      // Ignore the specific error - just return a 400
      return new Response('Invalid JSON body', { status: 400 });
    }

    if (!messages || !Array.isArray(messages)) {
      return new Response('Messages are required and must be an array', { status: 400 });
    }

    try {
      // Get OpenAI client (will throw if API key is missing)
      const openai = getOpenAIClient();
      
      // Create the streaming response from OpenAI
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant powered by GPT-4o. You provide concise, accurate, and helpful responses.',
          },
          ...messages,
        ],
        stream: true,
      });

      // Transform the OpenAI response into a ReadableStream
      const stream = createReadableStream(response);

      // Return a streaming response
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } catch (error) {
      console.error('OpenAI API error:', error);
      
      // Handle specific OpenAI errors
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          return new Response('OpenAI API key is missing or invalid', { status: 500 });
        }
        return new Response(`OpenAI Error: ${error.message}`, { status: 500 });
      }
      
      return new Response('Unknown error when calling OpenAI API', { status: 500 });
    }
  } catch (error) {
    console.error('General error in chat route:', error);
    return new Response('Error processing your request', { status: 500 });
  }
} 