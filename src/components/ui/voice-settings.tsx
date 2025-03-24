"use client"

import { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { getAvailableVoices, getAvailableModels, VoiceSettings } from '@/lib/tts'
import { Settings, RotateCcw } from 'lucide-react'

interface Voice {
  voice_id: string;
  name: string;
}

interface Model {
  model_id: string;
  name: string;
}

interface VoiceSettingsProps {
  voiceSettings: VoiceSettings
  onChange: (settings: VoiceSettings) => void
  onVoiceChange?: (voiceId: string) => void
  onModelChange?: (modelId: string) => void
  defaultVoiceId?: string
  defaultModelId?: string
  className?: string
}

export function VoiceSettingsPanel({
  voiceSettings,
  onChange,
  onVoiceChange,
  onModelChange,
  defaultVoiceId = 'EXAVITQu4vr4xnSDxMaL',
  defaultModelId = 'eleven_multilingual_v2',
  className
}: VoiceSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [voices, setVoices] = useState<Voice[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedVoiceId, setSelectedVoiceId] = useState(defaultVoiceId)
  const [selectedModelId, setSelectedModelId] = useState(defaultModelId)
  const [settings, setSettings] = useState<VoiceSettings>(voiceSettings)

  // Fetch available voices and models
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [voicesData, modelsData] = await Promise.all([
          getAvailableVoices(),
          getAvailableModels()
        ])
        setVoices(voicesData as Voice[])
        setModels(modelsData as Model[])
      } catch (error) {
        console.error('Error fetching voice data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen && voices.length === 0) {
      fetchData()
    }
  }, [isOpen, voices.length])

  // Update parent component when settings change
  const updateSettings = (update: Partial<VoiceSettings>) => {
    const newSettings = { ...settings, ...update }
    setSettings(newSettings)
    onChange(newSettings)
  }

  // Reset to defaults
  const resetValues = () => {
    const defaultSettings: VoiceSettings = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0,
      speed: 1.0,
      use_speaker_boost: true
    }
    setSettings(defaultSettings)
    onChange(defaultSettings)
  }

  // Handle voice change
  const handleVoiceChange = (value: string) => {
    setSelectedVoiceId(value)
    if (onVoiceChange) {
      onVoiceChange(value)
    }
  }

  // Handle model change
  const handleModelChange = (value: string) => {
    setSelectedModelId(value)
    if (onModelChange) {
      onModelChange(value)
    }
  }

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 rounded-full"
        aria-label="Voice Settings"
      >
        <Settings className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Voice Settings</span>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="voice">Voice</Label>
          <Select 
            value={selectedVoiceId} 
            onValueChange={handleVoiceChange}
            disabled={loading || voices.length === 0}
          >
            <SelectTrigger id="voice">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="loading" disabled>Loading voices...</SelectItem>
              ) : voices.length > 0 ? (
                voices.map((voice) => (
                  <SelectItem key={voice.voice_id} value={voice.voice_id}>
                    {voice.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No voices available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Select 
            value={selectedModelId} 
            onValueChange={handleModelChange}
            disabled={loading || models.length === 0}
          >
            <SelectTrigger id="model">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="loading" disabled>Loading models...</SelectItem>
              ) : models.length > 0 ? (
                models.map((model) => (
                  <SelectItem key={model.model_id} value={model.model_id}>
                    {model.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="eleven_multilingual_v2">Eleven Multilingual v2</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="speed">Speed</Label>
            <span className="text-xs text-muted-foreground">{settings.speed?.toFixed(1)}</span>
          </div>
          <Slider
            id="speed"
            min={0.5}
            max={2.0}
            step={0.1}
            value={[settings.speed || 1.0]}
            onValueChange={(values: number[]) => updateSettings({ speed: values[0] })}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Slower</span>
            <span>Faster</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="stability">Stability</Label>
            <span className="text-xs text-muted-foreground">{settings.stability.toFixed(2)}</span>
          </div>
          <Slider
            id="stability"
            min={0}
            max={1}
            step={0.01}
            value={[settings.stability]}
            onValueChange={(values: number[]) => updateSettings({ stability: values[0] })}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>More variable</span>
            <span>More stable</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="similarity">Similarity</Label>
            <span className="text-xs text-muted-foreground">{settings.similarity_boost.toFixed(2)}</span>
          </div>
          <Slider
            id="similarity"
            min={0}
            max={1}
            step={0.01}
            value={[settings.similarity_boost]}
            onValueChange={(values: number[]) => updateSettings({ similarity_boost: values[0] })}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="speaker-boost"
            checked={settings.use_speaker_boost}
            onCheckedChange={(checked) => updateSettings({ use_speaker_boost: checked })}
          />
          <Label htmlFor="speaker-boost">Speaker Boost</Label>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          onClick={resetValues}
          className="ml-auto flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset values</span>
        </Button>
      </CardFooter>
    </Card>
  )
} 