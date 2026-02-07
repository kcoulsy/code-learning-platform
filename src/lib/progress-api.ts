import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { z } from 'zod/v4'
import { db } from '@/db'
import {
  stepProgress,
  lessonProgress,
  courseVisits,
  userSettings,
  stepChats,
} from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import {
  encryptApiKey,
  decryptApiKey,
  generateUserEncryptionKey,
  encryptUserKey,
  decryptUserKey,
} from './auth'
import { auth } from './auth'

// Step Progress
export const getStepProgress = createServerFn()
  .inputValidator(
    z.object({
      userId: z.string(),
      courseId: z.string(),
      itemId: z.string(),
      stepId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const id = `${data.userId}:${data.courseId}:${data.itemId}:${data.stepId}`
    const result = await db.query.stepProgress.findFirst({
      where: eq(stepProgress.id, id),
    })
    return result || null
  })

export const updateStepProgress = createServerFn()
  .inputValidator(
    z.object({
      userId: z.string(),
      courseId: z.string(),
      itemId: z.string(),
      stepId: z.string(),
      completed: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    const id = `${data.userId}:${data.courseId}:${data.itemId}:${data.stepId}`
    const now = new Date()

    await db
      .insert(stepProgress)
      .values({
        id,
        userId: data.userId,
        courseId: data.courseId,
        itemId: data.itemId,
        stepId: data.stepId,
        completed: data.completed,
        completedAt: data.completed ? now : null,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: stepProgress.id,
        set: {
          completed: data.completed,
          completedAt: data.completed ? now : null,
          updatedAt: now,
        },
      })

    return { success: true }
  })

export const deleteStepProgress = createServerFn()
  .inputValidator(
    z.object({
      userId: z.string(),
      courseId: z.string(),
      itemId: z.string(),
      stepId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const id = `${data.userId}:${data.courseId}:${data.itemId}:${data.stepId}`
    await db.delete(stepProgress).where(eq(stepProgress.id, id))
    return { success: true }
  })

// Lesson Progress
export const getLessonProgress = createServerFn()
  .inputValidator(
    z.object({
      userId: z.string(),
      courseId: z.string(),
      itemId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const id = `${data.userId}:${data.courseId}:${data.itemId}`
    const result = await db.query.lessonProgress.findFirst({
      where: eq(lessonProgress.id, id),
    })
    return result || null
  })

export const updateLessonProgress = createServerFn()
  .inputValidator(
    z.object({
      userId: z.string(),
      courseId: z.string(),
      itemId: z.string(),
      completed: z.boolean(),
      manuallySet: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const id = `${data.userId}:${data.courseId}:${data.itemId}`
    const now = new Date()

    await db
      .insert(lessonProgress)
      .values({
        id,
        userId: data.userId,
        courseId: data.courseId,
        itemId: data.itemId,
        completed: data.completed,
        manuallySet: data.manuallySet ?? false,
        completedAt: data.completed ? now : null,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: lessonProgress.id,
        set: {
          completed: data.completed,
          manuallySet: data.manuallySet ?? false,
          completedAt: data.completed ? now : null,
          updatedAt: now,
        },
      })

    return { success: true }
  })

export const deleteLessonProgress = createServerFn()
  .inputValidator(
    z.object({
      userId: z.string(),
      courseId: z.string(),
      itemId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const id = `${data.userId}:${data.courseId}:${data.itemId}`
    await db.delete(lessonProgress).where(eq(lessonProgress.id, id))
    return { success: true }
  })

// Course Progress (all steps for a course)
export const getCourseStepProgress = createServerFn()
  .inputValidator(
    z.object({
      userId: z.string(),
      courseId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const results = await db.query.stepProgress.findMany({
      where: and(
        eq(stepProgress.userId, data.userId),
        eq(stepProgress.courseId, data.courseId),
      ),
    })
    return results
  })

export const getCourseLessonProgress = createServerFn()
  .inputValidator(
    z.object({
      userId: z.string(),
      courseId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const results = await db.query.lessonProgress.findMany({
      where: and(
        eq(lessonProgress.userId, data.userId),
        eq(lessonProgress.courseId, data.courseId),
      ),
    })
    return results
  })

// Course Visits
export const getCourseVisit = createServerFn()
  .inputValidator(
    z.object({
      userId: z.string(),
      courseId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const id = `${data.userId}:${data.courseId}`
    const result = await db.query.courseVisits.findFirst({
      where: eq(courseVisits.id, id),
    })
    return result || null
  })

export const updateCourseVisit = createServerFn()
  .inputValidator(
    z.object({
      userId: z.string(),
      courseId: z.string(),
      lastItemId: z.string(),
      lastStepId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const id = `${data.userId}:${data.courseId}`
    const now = new Date()

    await db
      .insert(courseVisits)
      .values({
        id,
        userId: data.userId,
        courseId: data.courseId,
        lastItemId: data.lastItemId,
        lastStepId: data.lastStepId,
        lastVisitedAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: courseVisits.id,
        set: {
          lastItemId: data.lastItemId,
          lastStepId: data.lastStepId,
          lastVisitedAt: now,
          updatedAt: now,
        },
      })

    return { success: true }
  })

// User Settings (AI Config)
export const getUserSettings = createServerFn()
  .inputValidator(
    z.object({
      userId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const result = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, data.userId),
    })

    if (!result) return null

    // Decrypt API key before returning
    let apiKey = null
    if (result.encryptedApiKey && result.keyEncryptionKey) {
      const userKey = decryptUserKey(result.keyEncryptionKey)
      apiKey = decryptApiKey(result.encryptedApiKey, userKey)
    }

    return {
      ...result,
      apiKey,
    }
  })

export const updateUserSettings = createServerFn()
  .inputValidator(
    z.object({
      userId: z.string(),
      aiProvider: z.string().optional(),
      aiModel: z.string().optional(),
      apiKey: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const now = new Date()

    // Get existing settings to check if we need to generate a new key
    const existing = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, data.userId),
    })

    // Generate or retrieve user's encryption key
    let userKey: string
    let encryptedUserKey: string

    if (existing?.keyEncryptionKey) {
      // Use existing key
      userKey = decryptUserKey(existing.keyEncryptionKey)
      encryptedUserKey = existing.keyEncryptionKey
    } else {
      // Generate new per-user encryption key
      userKey = generateUserEncryptionKey()
      encryptedUserKey = encryptUserKey(userKey)
    }

    // Encrypt API key with user's key
    const encryptedApiKey = data.apiKey
      ? encryptApiKey(data.apiKey, userKey)
      : existing?.encryptedApiKey || null

    await db
      .insert(userSettings)
      .values({
        id: data.userId,
        userId: data.userId,
        aiProvider: data.aiProvider || null,
        aiModel: data.aiModel || null,
        encryptedApiKey,
        keyEncryptionKey: encryptedUserKey,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userSettings.id,
        set: {
          aiProvider: data.aiProvider || null,
          aiModel: data.aiModel || null,
          encryptedApiKey,
          keyEncryptionKey: encryptedUserKey,
          updatedAt: now,
        },
      })

    return { success: true }
  })

export const deleteUserSettings = createServerFn()
  .inputValidator(
    z.object({
      userId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    await db.delete(userSettings).where(eq(userSettings.userId, data.userId))
    return { success: true }
  })

// Key Rotation - Generate new encryption key and re-encrypt API key
export const rotateUserEncryptionKey = createServerFn()
  .inputValidator(
    z.object({
      userId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const now = new Date()

    // Get existing settings
    const existing = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, data.userId),
    })

    if (!existing?.encryptedApiKey || !existing?.keyEncryptionKey) {
      return { success: false, error: 'No API key to rotate' }
    }

    // Decrypt existing API key with old key
    const oldUserKey = decryptUserKey(existing.keyEncryptionKey)
    const apiKey = decryptApiKey(existing.encryptedApiKey, oldUserKey)

    // Generate new per-user encryption key
    const newUserKey = generateUserEncryptionKey()
    const newEncryptedUserKey = encryptUserKey(newUserKey)

    // Re-encrypt API key with new key
    const newEncryptedApiKey = encryptApiKey(apiKey, newUserKey)

    // Update database with new keys
    await db
      .update(userSettings)
      .set({
        encryptedApiKey: newEncryptedApiKey,
        keyEncryptionKey: newEncryptedUserKey,
        updatedAt: now,
      })
      .where(eq(userSettings.userId, data.userId))

    return { success: true }
  })

// Step Chats
export const getStepChats = createServerFn()
  .inputValidator(
    z.object({
      userId: z.string(),
      courseId: z.string(),
      itemId: z.string(),
      stepId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const id = `${data.userId}:${data.courseId}:${data.itemId}:${data.stepId}`
    const result = await db.query.stepChats.findFirst({
      where: eq(stepChats.id, id),
    })
    return result?.messages || []
  })

export const saveStepChats = createServerFn()
  .inputValidator(
    z.object({
      userId: z.string(),
      courseId: z.string(),
      itemId: z.string(),
      stepId: z.string(),
      messages: z.array(z.any()),
    }),
  )
  .handler(async ({ data }) => {
    const id = `${data.userId}:${data.courseId}:${data.itemId}:${data.stepId}`
    const now = new Date()

    await db
      .insert(stepChats)
      .values({
        id,
        userId: data.userId,
        courseId: data.courseId,
        itemId: data.itemId,
        stepId: data.stepId,
        messages: data.messages,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: stepChats.id,
        set: {
          messages: data.messages,
          updatedAt: now,
        },
      })

    return { success: true }
  })

export const deleteStepChats = createServerFn()
  .inputValidator(
    z.object({
      userId: z.string(),
      courseId: z.string(),
      itemId: z.string(),
      stepId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const id = `${data.userId}:${data.courseId}:${data.itemId}:${data.stepId}`
    await db.delete(stepChats).where(eq(stepChats.id, id))
    return { success: true }
  })

// Chat streaming with AI
export const streamChat = createServerFn({
  method: 'POST',
})
  .inputValidator(
    z.object({
      courseId: z.string(),
      itemId: z.string(),
      stepId: z.string(),
      messages: z.array(
        z.object({
          role: z.enum(['user', 'assistant', 'system']),
          content: z.string(),
        }),
      ),
      systemPrompt: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    // Get user session from request headers
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const userId = session.user.id

    // Get user's AI configuration
    const settings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, userId),
    })

    if (!settings?.encryptedApiKey || !settings?.keyEncryptionKey) {
      return new Response(
        JSON.stringify({ error: 'AI configuration not found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Decrypt the user's API key
    const userKey = decryptUserKey(settings.keyEncryptionKey)
    const apiKey = decryptApiKey(settings.encryptedApiKey, userKey)

    // Import AI SDKs dynamically
    const { streamText } = await import('ai')
    const { createOpenAI } = await import('@ai-sdk/openai')
    const { createAnthropic } = await import('@ai-sdk/anthropic')
    const { ollama } = await import('ollama-ai-provider')

    let model

    switch (settings.aiProvider) {
      case 'openai': {
        const openai = createOpenAI({ apiKey })
        model = openai(settings.aiModel!)
        break
      }
      case 'anthropic': {
        const anthropic = createAnthropic({ apiKey })
        model = anthropic(settings.aiModel!)
        break
      }
      case 'ollama': {
        model = ollama(settings.aiModel!)
        break
      }
      default:
        return new Response(
          JSON.stringify({ error: 'Unsupported AI provider' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        )
    }

    // Stream the response
    const result = streamText({
      model: model as any,
      messages: data.messages,
      system: data.systemPrompt,
    })

    // Return the stream directly
    return result.toTextStreamResponse()
  })
