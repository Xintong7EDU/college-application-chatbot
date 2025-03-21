"use client"

import React, { useEffect } from 'react'
import { useChatStore } from '@/lib/store'
import { ChatList } from './chat-list'
import { ChatInput } from './chat-input'
import { Sidebar } from './sidebar'

export function Chat() {
  const { createNewSession, sessions } = useChatStore()
  
  // Create a new session if none exists
  useEffect(() => {
    if (sessions.length === 0) {
      createNewSession()
    }
  }, [sessions.length, createNewSession])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <ChatList />
        <ChatInput />
      </div>
    </div>
  )
} 