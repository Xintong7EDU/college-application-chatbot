import { streamText } from "ai"
import { 
  DEFAULT_PARAMS, 
  validateOpenAIConfig,
  getOpenAIModel,
  getSystemPrompt,
  getModelParams
} from "@/lib/openai-config"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// Helper function to generate error responses
const createErrorResponse = (message: string, status = 500) => {
  return new Response(
    JSON.stringify({
      error: message,
    }),
    { status }
  )
}

export async function POST(req: Request) {
  try {
    // Clone request to read headers without affecting the body
    const reqClone = req.clone()
    const headers = Object.fromEntries(reqClone.headers.entries())
    
    // Check for client-side API key in custom header
    const clientApiKey = headers['x-openai-api-key']
    
    // Check for conversation style preference
    const stylePreference = headers['x-conversation-style'] || 'counselor'
    console.log(`Using conversation style: ${stylePreference}`)
    
    // Set API key for this request if provided from client
    let apiKeyConfigured = validateOpenAIConfig()
    
    if (clientApiKey) {
      console.log('Using client-provided API key')
      // Set environment variable temporarily for this request
      process.env.OPENAI_API_KEY = clientApiKey
      apiKeyConfigured = true
    } else {
      console.log('Using server-configured API key')
    }
    
    const { messages } = await req.json()
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("Invalid request: no messages provided")
      return createErrorResponse("No messages provided in request", 400)
    }
    
    console.log(`Processing chat request with ${messages.length} messages`)
    
    // Make sure we have a valid API key
    if (!apiKeyConfigured) {
      console.error("Cannot process request: OPENAI_API_KEY is not configured")
      return createErrorResponse("OpenAI API key is not configured", 500)
    }

    try {
      // Get the query from the last user message
      const lastUserMessage = messages.findLast((msg: any) => msg.role === 'user');
      const query = lastUserMessage?.content || '';
      console.log(`Query for system prompt: ${query.substring(0, 50)}${query.length > 50 ? '...' : ''}`);
      
      // Get system prompt and model parameters based on style preference
      const systemPrompt = getSystemPrompt(stylePreference, query);
      const modelParams = getModelParams(stylePreference);
      
      console.log("Using system prompt:", systemPrompt.substring(0, 100) + "...")
      console.log("Using model parameters:", JSON.stringify(modelParams))
      
      const result = streamText({
        model: getOpenAIModel(),
        system: systemPrompt,
        messages,
        ...modelParams,
      })
      
      console.log("Stream created successfully, returning response")
      return result.toDataStreamResponse()
    } catch (streamError) {
      console.error("Error creating stream:", streamError)
      return createErrorResponse("Error creating response stream", 500)
    }
  } catch (error: any) {
    console.error("Error in chat API:", error)
    const errorMessage = error?.message || "There was an error processing your request"
    return createErrorResponse(errorMessage, 500)
  }
}

