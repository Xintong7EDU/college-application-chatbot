"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { MessageSquare } from 'lucide-react'

interface StyleOption {
  id: string
  name: string
  description: string
}

const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'counselor',
    name: 'College Counselor',
    description: 'Conversational style mimicking a real college application counselor'
  },
  {
    id: 'simple',
    name: 'Simple & Focused',
    description: 'Clear, concise responses with one question at a time'
  }
]

export default function ConversationStyleToggle() {
  const [activeStyle, setActiveStyle] = useState<string>('counselor')
  const [open, setOpen] = useState(false)
  
  // Load from localStorage on mount
  useEffect(() => {
    const savedStyle = localStorage.getItem('conversation-style')
    if (savedStyle) {
      setActiveStyle(savedStyle)
    }
  }, [])
  
  // Save to localStorage when changed
  const handleStyleChange = (styleId: string) => {
    setActiveStyle(styleId)
    localStorage.setItem('conversation-style', styleId)
    setOpen(false)
    // Show confirmation message
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-green-100 text-green-800 p-3 rounded shadow-md z-50 animate-in fade-in slide-in-from-top-5'
    toast.textContent = `Conversation style updated to: ${STYLE_OPTIONS.find(s => s.id === styleId)?.name}`
    document.body.appendChild(toast)
    setTimeout(() => {
      toast.classList.add('animate-out', 'fade-out', 'slide-out-to-top-5')
      setTimeout(() => toast.remove(), 300)
    }, 3000)
    // Force reload to apply changes
    setTimeout(() => window.location.reload(), 500)
  }
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 border-white/50 text-white">
          <MessageSquare className="h-4 w-4 mr-2" />
          <span className="text-xs font-normal">Style</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">Conversation Style</h4>
          <p className="text-sm text-muted-foreground">Choose how the assistant communicates with you</p>
          <div className="space-y-3 pt-2">
            {STYLE_OPTIONS.map(style => (
              <div 
                key={style.id} 
                className={`p-3 rounded-md cursor-pointer hover:bg-slate-100 transition-colors ${
                  activeStyle === style.id ? 'bg-slate-100 border border-slate-200' : ''
                }`}
                onClick={() => handleStyleChange(style.id)}
              >
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium cursor-pointer">
                    {style.name}
                  </Label>
                  <Switch 
                    checked={activeStyle === style.id}
                    onCheckedChange={() => handleStyleChange(style.id)}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {style.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 