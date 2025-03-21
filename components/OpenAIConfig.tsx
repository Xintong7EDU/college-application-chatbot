"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings } from "lucide-react"

export function OpenAIConfig() {
  const [apiKey, setApiKey] = useState("")
  const [open, setOpen] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  
  // Load API key from localStorage on component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem("openai-api-key")
    if (storedApiKey) {
      setApiKey(storedApiKey)
      setIsSaved(true)
    }
  }, [])
  
  const handleSave = () => {
    if (apiKey) {
      localStorage.setItem("openai-api-key", apiKey)
      console.log("API key saved to localStorage")
      setIsSaved(true)
      setOpen(false)
      
      // Force reload to apply the new API key
      window.location.reload()
    }
  }
  
  const handleClear = () => {
    localStorage.removeItem("openai-api-key")
    setApiKey("")
    setIsSaved(false)
    console.log("API key cleared from localStorage")
    
    // Force reload to apply changes
    window.location.reload()
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="absolute top-4 right-4">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>OpenAI Configuration</DialogTitle>
          <DialogDescription>
            Configure your OpenAI API key to use the chat functionality.
            {isSaved && <span className="text-green-600 ml-1 font-medium">✓ API Key is saved</span>}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apiKey" className="text-right">
              API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-xxxxxxxxxxxx"
              className="col-span-3"
            />
          </div>
          <div className="text-sm text-gray-500 col-span-full">
            Your API key is stored locally in your browser and is never sent to our servers.
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          {isSaved && (
            <Button variant="destructive" onClick={handleClear}>
              Clear API Key
            </Button>
          )}
          <Button type="submit" onClick={handleSave} disabled={!apiKey}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 