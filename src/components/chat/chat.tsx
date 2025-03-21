"use client"

import React, { useEffect } from 'react'
import { useChatStore } from '@/lib/store'
import { ChatList } from './chat-list'
import { ChatInput } from './chat-input'
import { Sidebar } from './sidebar'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { GraduationCap } from 'lucide-react'

export function Chat() {
  const { 
    createNewSession, 
    sessions, 
    useSpecialPrompt, 
    setUseSpecialPrompt 
  } = useChatStore()
  
  // Create a new session if none exists
  useEffect(() => {
    if (sessions.length === 0) {
      createNewSession()
    }
  }, [sessions.length, createNewSession])

  const handleTogglePrompt = () => {
    console.log('Toggling prompt mode:', !useSpecialPrompt)
    setUseSpecialPrompt(!useSpecialPrompt)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <div className="sticky top-0 bg-background z-10 p-2 border-b flex items-center justify-end">
          <div className="flex items-center space-x-2">
            <GraduationCap className={`w-5 h-5 ${useSpecialPrompt ? 'text-primary' : 'text-muted-foreground'}`} />
            <Switch
              id="special-prompt"
              checked={useSpecialPrompt}
              onCheckedChange={handleTogglePrompt}
            />
            <Label htmlFor="special-prompt" className="cursor-pointer">
              College Counselor Mode
            </Label>
          </div>
        </div>
        <ChatList />
        <ChatInput />
      </div>
    </div>
  )
} 