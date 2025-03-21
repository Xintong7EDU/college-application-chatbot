"use client"

import { useRef, useEffect, useState } from "react"
import { Send, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useOpenAIChat } from "@/hooks/useOpenAIChat"
import { OpenAIConfig } from "@/components/OpenAIConfig"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ConversationStyleToggle from "@/components/ConversationStyleToggle"

export default function ChatBot() {
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading,
    error,
    hasApiKey,
    clearChat 
  } = useOpenAIChat({
    onError: (error) => {
      console.error("Chat error occurred:", error)
    },
    onMessageComplete: (message) => {
      console.log("Message completed:", message.id)
    },
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [stylePreference, setStylePreference] = useState<string>('counselor')
  
  // Get style preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedStyle = localStorage.getItem('conversation-style')
      if (storedStyle) {
        setStylePreference(storedStyle)
      }
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
      <Card className="w-full max-w-2xl shadow-lg border-green-200 relative">
        <OpenAIConfig />
        <ConversationStyleToggle />
        <CardHeader className="bg-green-600 text-white flex flex-row justify-between items-center">
          <CardTitle className="text-center flex-1">
            College Application {stylePreference === 'counselor' ? 'Counselor' : 'Assistant'}
          </CardTitle>
          {messages.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-white border-white hover:bg-green-700" 
              onClick={clearChat}
            >
              <RefreshCw className="h-4 w-4 mr-1" /> New Chat
            </Button>
          )}
        </CardHeader>
        <CardContent className="h-[70vh] overflow-y-auto p-4 bg-white">
          {!hasApiKey && (
            <Alert className="mb-4 bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                No OpenAI API key configured. Click the settings icon in the top right to add your API key.
              </AlertDescription>
            </Alert>
          )}
          
          {messages.length === 0 && (
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                {stylePreference === 'counselor' 
                  ? "The assistant uses a realistic college counselor conversation style to help with your application questions."
                  : "The assistant uses simple, focused responses with one question at a time."}
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded mb-4">
              Error: {error.message || "Something went wrong. Please try again."}
            </div>
          )}
          
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-4">
              <div className="bg-green-100 p-6 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-lg text-green-800">Welcome to the College Application Assistant!</h3>
                <p className="mt-1">Ask me anything about college applications, essays, scholarships, or admissions.</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-green-600 text-white rounded-tr-none"
                      : "bg-gray-100 text-gray-800 rounded-tl-none"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <CardFooter className="bg-white border-t p-4">
          <form onSubmit={handleSubmit} className="flex w-full space-x-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about college applications..."
              className="flex-grow border-green-200 focus-visible:ring-green-500"
              disabled={!hasApiKey}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim() || !hasApiKey} 
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

