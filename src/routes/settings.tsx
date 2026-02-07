'use client'

import { useState, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Settings,
  Eye,
  EyeOff,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAIConfig } from '@/lib/ai-config-hooks'
import { PROVIDER_MODELS } from '@/lib/db'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/auth/user-menu'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { config, updateConfig, hasValidConfig, isUpdateSuccess } =
    useAIConfig()
  const [showApiKey, setShowApiKey] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Local form state
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'ollama'>(
    config?.provider ?? 'openai',
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
  }

  // Show success message when mutation succeeds
  useEffect(() => {
    if (isUpdateSuccess) {
      setSaveSuccess(true)
      const timer = setTimeout(() => setSaveSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isUpdateSuccess])

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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-10 w-10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground">
                  Manage your account and AI configuration
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* AI Configuration Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle>AI Configuration</CardTitle>
              </div>
              <CardDescription>
                Configure your AI provider and API key for the chat feature.
                {hasValidConfig && (
                  <span className="inline-flex items-center gap-1 ml-2 text-green-600 dark:text-green-500">
                    <CheckCircle2 className="h-4 w-4" />
                    Configured
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Privacy Notice */}
              <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4 text-sm space-y-2">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Privacy & Security
                </p>
                <ul className="space-y-1 text-blue-800 dark:text-blue-200 text-xs">
                  <li>
                    • All API calls are made directly from your browser to the
                    AI provider
                  </li>
                  <li>
                    • Your API key is encrypted and stored in our database
                  </li>
                  <li>
                    • We have access to your API key (it is stored on our
                    servers)
                  </li>
                  <li className="font-medium">• Use at your own risk</li>
                </ul>
              </div>

              {/* Provider Selection */}
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select
                  value={provider}
                  onValueChange={(v) => setProvider(v as any)}
                >
                  <SelectTrigger id="provider" className="w-full">
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">
                      Anthropic / Claude
                    </SelectItem>
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
                  {helpInfo &&
                    helpInfo.url &&
                    helpInfo.text !==
                      'No API key required for local Ollama' && (
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
                <div className="rounded-lg border border-muted bg-muted/50 p-4 text-sm">
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

              {/* Success Message */}
              {saveSuccess && (
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Settings saved successfully!
                  </AlertDescription>
                </Alert>
              )}

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={!isValid}
                className="w-full"
              >
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
