export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export interface StepChat {
  stepId: string
  messages: ChatMessage[]
}

const STORAGE_KEY = "learncode-chats"

export function getChatKey(
  courseId: string,
  itemId: string,
  stepId: string
): string {
  return `${courseId}:${itemId}:${stepId}`
}

export function getAllChats(): Record<string, StepChat> {
  if (typeof window === "undefined") return {}
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

export function getStepChat(
  courseId: string,
  itemId: string,
  stepId: string
): ChatMessage[] {
  const chats = getAllChats()
  const key = getChatKey(courseId, itemId, stepId)
  return chats[key]?.messages || []
}

export function saveStepChat(
  courseId: string,
  itemId: string,
  stepId: string,
  messages: ChatMessage[]
): void {
  if (typeof window === "undefined") return
  const chats = getAllChats()
  const key = getChatKey(courseId, itemId, stepId)
  chats[key] = {
    stepId,
    messages,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
}

export function clearStepChat(
  courseId: string,
  itemId: string,
  stepId: string
): void {
  if (typeof window === "undefined") return
  const chats = getAllChats()
  const key = getChatKey(courseId, itemId, stepId)
  delete chats[key]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
}
