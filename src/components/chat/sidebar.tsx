"use client"

import React from 'react'
import { useChatStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { ChatSession } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'

export function Sidebar() {
  const { 
    sessions, 
    currentSessionId, 
    createNewSession, 
    setCurrentSessionId, 
    deleteSession 
  } = useChatStore()

  const handleNewChat = () => {
    createNewSession()
  }

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id)
  }

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteSession(id)
  }

  return (
    <aside className="flex h-full w-[260px] flex-col border-r bg-muted/40">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-xl font-bold">GPT-4o Chat</h1>
        <ThemeToggle />
      </div>
      
      <div className="p-4">
        <Button onClick={handleNewChat} className="w-full" variant="default">
          <PlusIcon className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
      
      <Separator />
      
      <div className="flex-1 overflow-auto py-2">
        <div className="space-y-1 px-2">
          {sessions.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              No conversations yet
            </p>
          ) : (
            sessions.map((session: ChatSession) => (
              <div
                key={session.id}
                className={cn(
                  'group flex cursor-pointer items-center justify-between rounded-md px-3 py-2 hover:bg-accent',
                  currentSessionId === session.id && 'bg-accent'
                )}
                onClick={() => handleSelectSession(session.id)}
              >
                <div className="truncate">
                  <p className="truncate text-sm font-medium">{session.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatDate(session.updatedAt)}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                  onClick={(e) => handleDeleteSession(e, session.id)}
                >
                  <Trash2Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  )
} 