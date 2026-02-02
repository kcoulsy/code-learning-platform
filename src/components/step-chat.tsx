import React from "react"
import { useState, useEffect, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
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
} from "lucide-react"

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
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const isLoading = status === "streaming" || status === "submitted"

  // Load saved messages on mount
  useEffect(() => {
    const saved = getStepChat(courseId, itemId, stepId)
    if (saved.length > 0) {
      setLocalMessages(saved)
    }
  }, [courseId, itemId, stepId])

  // Sync useChat messages to localStorage
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      const chatMessages: ChatMessage[] = messages.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content:
          msg.parts
            ?.filter((p) => p.type === "text")
            .map((p) => (p as { type: "text"; text: string }).text)
            .join("") || "",
        timestamp: Date.now(),
      }))
      setLocalMessages(chatMessages)
      saveStepChat(courseId, itemId, stepId, chatMessages)
    }
  }, [messages, isLoading, courseId, itemId, stepId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [localMessages, messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Build context for the AI
    const contextMessage = `You are a helpful programming tutor. The student is learning from a course step titled "${stepTitle}".

Here is the content they are studying:
---
${stepContent}
---

The student has a question about this specific content. Answer clearly and concisely, using examples from the content when relevant. If they ask something outside the scope of this content, gently guide them back to the topic.

Student's question: ${input}`

    sendMessage({
      text: contextMessage,
    })
    setInput("")
  }

  const handleClear = () => {
    clearStepChat(courseId, itemId, stepId)
    setLocalMessages([])
    setMessages([])
  }

  // Render messages - prefer streaming messages when available, fall back to local
  const displayMessages = messages.length > 0 ? messages : localMessages

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all",
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
            {localMessages.length > 0 && (
              <span className="bg-primary-foreground text-primary text-xs px-1.5 py-0.5 rounded-full">
                {localMessages.length}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-card border border-border rounded-xl shadow-2xl transition-all duration-300 flex flex-col",
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
        style={{ height: "500px", maxHeight: "calc(100vh - 8rem)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Q&A for this Step</span>
          </div>
          <div className="flex items-center gap-1">
            {localMessages.length > 0 && (
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
          {displayMessages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No questions yet</p>
              <p className="text-xs mt-1">
                Ask anything about &quot;{stepTitle}&quot;
              </p>
            </div>
          ) : (
            displayMessages.map((message, index) => {
              const isUser = message.role === "user"
              let content = ""

              if ("parts" in message && message.parts) {
                content =
                  message.parts
                    .filter((p) => p.type === "text")
                    .map((p) => (p as { type: "text"; text: string }).text)
                    .join("") || ""
              } else if ("content" in message) {
                content = (message as ChatMessage).content
              }

              // For user messages, extract the actual question from the context
              if (isUser && content.includes("Student's question:")) {
                content = content.split("Student's question:")[1].trim()
              }

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
                    <p className="whitespace-pre-wrap">{content}</p>
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
              placeholder="Ask about this step..."
              disabled={isLoading}
              className="flex-1 bg-background"
            />
            <Button type="submit" size="sm" disabled={isLoading || !input.trim()}>
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
