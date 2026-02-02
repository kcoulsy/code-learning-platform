import React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  getStepChat,
  saveStepChat,
  clearStepChat,
  type ChatMessage,
} from "@/lib/chat-storage"
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Trash2,
  ChevronDown,
  AlertCircle,
} from "lucide-react"
import { ChatMessageContent } from "@/components/chat-message-content"
import { useAIConfig } from "@/lib/ai-config-hooks"
import { streamClientChat } from "@/lib/client-chat"
import { AISettingsDialog } from "@/components/ai-settings-dialog"

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
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { config, hasValidConfig } = useAIConfig()

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !hasValidConfig || !config) return

    setError(null)
    const userQuestion = input.trim()
    setInput("")

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
      role: "user",
      content: userQuestion,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Convert chat messages to CoreMessage format
      const coreMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      // Add the new user message
      coreMessages.push({
        role: "user",
        content: userQuestion,
      })

      // Stream the response
      const result = await streamClientChat(config, coreMessages, systemPrompt)

      // Create assistant message placeholder
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Stream the text
      let fullText = ""
      for await (const textPart of result.textStream) {
        fullText += textPart
        setMessages((prev) => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage && lastMessage.role === "assistant") {
            lastMessage.content = fullText
          }
          return newMessages
        })
      }
    } catch (err) {
      console.error("Chat error:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Failed to get response. Check your API key and try again."
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

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all",
          isOpen
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary text-primary-foreground hover:scale-105"
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
          "fixed bottom-40 right-6 z-50 w-[600px] max-w-[calc(100vw-3rem)] bg-card border border-border rounded-xl shadow-2xl transition-all duration-300 flex flex-col",
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
        style={{ height: "700px", maxHeight: "calc(100vh - 12rem)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Q&A for this Step</span>
          </div>
          <div className="flex items-center gap-1">
            <AISettingsDialog />
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
              {!hasValidConfig ? (
                <>
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium mb-2">
                    AI chat requires configuration
                  </p>
                  <div className="text-xs space-y-1 mb-4 max-w-sm mx-auto">
                    <p>Your API key is stored locally in your browser only</p>
                    <p>
                      No data is shared with our servers - all calls go directly
                      to AI providers
                    </p>
                    <p>Verify our code on GitHub</p>
                    <p className="font-medium">Use at your own risk</p>
                  </div>
                  <AISettingsDialog
                    triggerClassName="mx-auto"
                  />
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
              const isUser = message.role === "user"
              return (
                <div
                  key={message.id || index}
                  className={cn(
                    "flex",
                    isUser ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <ChatMessageContent content={message.content} />
                    )}
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
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                hasValidConfig
                  ? "Ask about this step..."
                  : "Configure AI settings first..."
              }
              disabled={isLoading || !hasValidConfig}
              className="flex-1 bg-background"
            />
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !input.trim() || !hasValidConfig}
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
