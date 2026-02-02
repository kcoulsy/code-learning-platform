'use client'

import { useState, useEffect } from 'react'
import { Settings, Eye, EyeOff, ExternalLink, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAIConfig } from '@/lib/ai-config-hooks'
import { PROVIDER_MODELS } from '@/lib/ai-config-collection'
import { cn } from '@/lib/utils'

interface AISettingsDialogProps {
  triggerClassName?: string
}

export function AISettingsDialog({ triggerClassName }: AISettingsDialogProps) {
  const { config, updateConfig, hasValidConfig } = useAIConfig()
  const [open, setOpen] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  // Local form state
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'ollama'>(
    config?.provider ?? 'openai'
  )
  const [model, setModel] = useState(config?.model ?? '')
  const [apiKey, setApiKey] = useState(config?.apiKey ?? '')

  // Sync form state when config changes
  useEffect(() => {
    if (config) {
      setProvider(config.provider)
      setModel(config.model)
      setApiKey(config.apiKey)
    }
  }, [config])

  // Update model list when provider changes
  const availableModels = PROVIDER_MODELS[provider] || []
  useEffect(() => {
    // Reset model if it's not valid for the new provider
    const isValidModel = availableModels.some((m) => m.value === model)
    if (!isValidModel && availableModels.length > 0) {
      setModel(availableModels[0].value)
    }
  }, [provider, availableModels, model])

  // Validation
  const validateApiKey = (key: string): boolean => {
    if (provider === 'ollama') return true // No key needed for Ollama
    if (!key) return false

    if (provider === 'openai' && !key.startsWith('sk-')) {
      return false
    }

    if (provider === 'anthropic' && !key.startsWith('sk-ant-')) {
      return false
    }

    return true
  }

  const isValid = model && validateApiKey(apiKey)

  const handleSave = () => {
    if (!isValid) return

    updateConfig({
      provider,
      model,
      apiKey,
    })

    setOpen(false)
  }

  const getProviderName = (p: string) => {
    switch (p) {
      case 'openai':
        return 'OpenAI'
      case 'anthropic':
        return 'Anthropic/Claude'
      case 'ollama':
        return 'Ollama'
      default:
        return p
    }
  }

  const getApiKeyHelp = () => {
    switch (provider) {
      case 'openai':
        return {
          text: 'Get your API key from OpenAI',
          url: 'https://platform.openai.com/api-keys',
        }
      case 'anthropic':
        return {
          text: 'Get your API key from Anthropic',
          url: 'https://console.anthropic.com/settings/keys',
        }
      case 'ollama':
        return {
          text: 'No API key required for local Ollama',
          url: 'https://ollama.ai',
        }
      default:
        return null
    }
  }

  const helpInfo = getApiKeyHelp()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 w-8 p-0 relative',
            hasValidConfig && 'text-green-600 dark:text-green-500',
            triggerClassName
          )}
        >
          <Settings className="h-4 w-4" />
          {hasValidConfig && (
            <CheckCircle2 className="h-3 w-3 absolute -top-1 -right-1 text-green-600 dark:text-green-500" />
          )}
          <span className="sr-only">AI Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>AI Configuration</DialogTitle>
          <DialogDescription>
            Configure your AI provider and API key for the chat feature.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Privacy Notice */}
          <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-3 text-sm space-y-2">
            <p className="font-medium text-blue-900 dark:text-blue-100">
              Privacy & Security
            </p>
            <ul className="space-y-1 text-blue-800 dark:text-blue-200 text-xs">
              <li>
                • All API calls are made directly from your browser to the AI
                provider
              </li>
              <li>
                • Your API key is stored locally in your browser only (IndexedDB)
              </li>
              <li>
                • We do not have access to your API key or chat content
              </li>
              <li>
                • Verify our code on{' '}
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-600 dark:hover:text-blue-300"
                >
                  GitHub
                </a>
              </li>
              <li className="font-medium">• Use at your own risk</li>
            </ul>
          </div>

          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select value={provider} onValueChange={(v) => setProvider(v as any)}>
              <SelectTrigger id="provider" className="w-full">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic / Claude</SelectItem>
                <SelectItem value="ollama">Ollama (Local)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="model" className="w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* API Key Input */}
          {provider !== 'ollama' && (
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    provider === 'openai' ? 'sk-...' : 'sk-ant-...'
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showApiKey ? 'Hide' : 'Show'} API key
                  </span>
                </button>
              </div>
              {helpInfo && helpInfo.url && helpInfo.text !== 'No API key required for local Ollama' && (
                <p className="text-xs text-muted-foreground">
                  <a
                    href={helpInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    {helpInfo.text}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              )}
              {apiKey && !validateApiKey(apiKey) && (
                <p className="text-xs text-destructive">
                  Invalid API key format for {getProviderName(provider)}
                </p>
              )}
            </div>
          )}

          {/* Ollama Info */}
          {provider === 'ollama' && (
            <div className="rounded-lg border border-muted bg-muted/50 p-3 text-sm">
              <p className="text-muted-foreground">
                Ollama runs locally on your machine. Make sure Ollama is
                installed and running at{' '}
                <code className="text-xs bg-background px-1 py-0.5 rounded">
                  http://localhost:11434
                </code>
              </p>
              {helpInfo && (
                <a
                  href={helpInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
                >
                  Learn more about Ollama
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
