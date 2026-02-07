import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  getStepChat,
  saveStepChat,
  clearStepChat,
  type ChatMessage,
} from '@/lib/chat-storage'
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Trash2,
  ChevronDown,
  AlertCircle,
  Copy,
  Check,
  Settings,
} from 'lucide-react'
import { ChatMessageContent } from '@/components/chat-message-content'
import { useAIConfig } from '@/lib/ai-config-hooks'
import { useSession } from '@/lib/auth-client'
import { Link } from '@tanstack/react-router'
import { streamChat } from '@/lib/progress-api'

interface StepChatProps {
  courseId: string
  itemId: string
  stepId: string
  stepTitle: string
  stepContent: string
}

export function StepChat({
  courseId,
  itemId,
  stepId,
  stepTitle,
  stepContent,
}: StepChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { hasValidConfig } = useAIConfig()
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user

  // Load saved messages on mount
  useEffect(() => {
    const saved = getStepChat(courseId, itemId, stepId)
    if (saved.length > 0) {
      setMessages(saved)
    }
  }, [courseId, itemId, stepId])

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveStepChat(courseId, itemId, stepId, messages)
    }
  }, [messages, courseId, itemId, stepId])

  // Scroll to bottom when messages change
  useEffect(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !hasValidConfig || !isLoggedIn) return

    setError(null)
    const userQuestion = input.trim()
    setInput('')

    // Build context for the AI
    const systemPrompt = `You are a helpful programming tutor. The student is learning from a course step titled "${stepTitle}".

Here is the content they are studying:
---
${stepContent}
---

The student has a question about this specific content. Answer clearly and concisely, using examples from the content when relevant. If they ask something outside the scope of this content, gently guide them back to the topic.`

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userQuestion,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Convert chat messages to ModelMessage format
      const modelMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      // Add the new user message
      modelMessages.push({
        role: 'user',
        content: userQuestion,
      })

      // Call server-side streaming function
      const response = await streamChat({
        data: {
          courseId,
          itemId,
          stepId,
          messages: modelMessages,
          systemPrompt,
        },
      })

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      // Create assistant message placeholder
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Stream the response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk

        setMessages((prev) => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content = fullText
          }
          return newMessages
        })
      }
    } catch (err) {
      console.error('Chat error:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to get response. Check your API key and try again.',
      )
      // Remove the user message on error
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    clearStepChat(courseId, itemId, stepId)
    setMessages([])
  }

  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all',
          isOpen
            ? 'bg-secondary text-secondary-foreground'
            : 'bg-primary text-primary-foreground hover:scale-105',
        )}
      >
        {isOpen ? (
          <>
            <ChevronDown className="h-5 w-5" />
            <span className="font-medium">Close</span>
          </>
        ) : (
          <>
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">Ask a Question</span>
            {messages.length > 0 && (
              <span className="bg-primary-foreground text-primary text-xs px-1.5 py-0.5 rounded-full">
                {messages.length}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          'fixed bottom-40 right-6 z-50 w-[600px] max-w-[calc(100vw-3rem)] bg-card border border-border rounded-xl shadow-2xl transition-all duration-300 flex flex-col',
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none',
        )}
        style={{ height: '700px', maxHeight: 'calc(100vh - 12rem)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Q&A for this Step</span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              to="/settings"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-8 w-8"
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Link>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Clear chat</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {!isLoggedIn ? (
                <>
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium mb-2">
                    Please log in to use AI chat
                  </p>
                  <div className="text-xs space-y-1 mb-4 max-w-sm mx-auto">
                    <p>You need to be logged in to ask questions</p>
                    <p>You must provide your own AI API key in settings</p>
                    <p className="font-medium">Use at your own risk</p>
                  </div>
                  <Button asChild className="mx-auto">
                    <Link to="/login">Log In</Link>
                  </Button>
                </>
              ) : !hasValidConfig ? (
                <>
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium mb-2">
                    AI chat requires configuration
                  </p>
                  <div className="text-xs space-y-1 mb-4 max-w-sm mx-auto">
                    <p>You must provide your own AI API key</p>
                    <p>Your API key is encrypted and stored securely</p>
                    <p className="font-medium">Use at your own risk</p>
                  </div>
                  <Button asChild className="mx-auto">
                    <Link to="/settings">Configure AI Settings</Link>
                  </Button>
                </>
              ) : (
                <>
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No questions yet</p>
                  <p className="text-xs mt-1">
                    Ask anything about &quot;{stepTitle}&quot;
                  </p>
                </>
              )}
            </div>
          ) : (
            messages.map((message, index) => {
              const isUser = message.role === 'user'
              const isCopied = copiedMessageId === message.id
              return (
                <div
                  key={message.id || index}
                  className={cn(
                    'flex group',
                    isUser ? 'justify-end' : 'justify-start',
                  )}
                >
                  <div className="flex items-start gap-2 max-w-[85%]">
                    <div
                      className={cn(
                        'flex-1 rounded-xl px-3 py-2 text-sm',
                        isUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground',
                      )}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <ChatMessageContent content={message.content} />
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleCopyMessage(message.id, message.content)
                      }
                      className={cn(
                        'h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity',
                        isUser ? 'order-first' : '',
                      )}
                      title="Copy message"
                    >
                      {isCopied ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span className="sr-only">Copy message</span>
                    </Button>
                  </div>
                </div>
              )
            })
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary text-secondary-foreground rounded-xl px-3 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          {error && (
            <div className="flex justify-center">
              <div className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-3 border-t border-border bg-secondary/30 rounded-b-xl"
        >
          <div className="flex gap-2 items-end">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder={
                !isLoggedIn
                  ? 'Please log in to use AI chat...'
                  : !hasValidConfig
                    ? 'Configure AI settings first...'
                    : 'Ask about this step... (Enter to send, Shift+Enter for new line)'
              }
              disabled={isLoading || !isLoggedIn || !hasValidConfig}
              className="flex-1 bg-background min-h-[40px] max-h-[120px] resize-none"
              rows={1}
            />
            <Button
              type="submit"
              size="sm"
              disabled={
                isLoading || !input.trim() || !isLoggedIn || !hasValidConfig
              }
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
