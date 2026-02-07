import { pgTable, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Better-auth will create its own tables (user, session, account, verification)
// We only define our custom tables here

export const stepProgress = pgTable('step_progress', {
  id: text('id').primaryKey(), // Composite: userId:courseId:itemId:stepId
  userId: text('user_id').notNull(),
  courseId: text('course_id').notNull(),
  itemId: text('item_id').notNull(),
  stepId: text('step_id').notNull(),
  completed: boolean('completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const lessonProgress = pgTable('lesson_progress', {
  id: text('id').primaryKey(), // Composite: userId:courseId:itemId
  userId: text('user_id').notNull(),
  courseId: text('course_id').notNull(),
  itemId: text('item_id').notNull(),
  completed: boolean('completed').notNull().default(false),
  manuallySet: boolean('manually_set').notNull().default(false),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const courseVisits = pgTable('course_visits', {
  id: text('id').primaryKey(), // Composite: userId:courseId
  userId: text('user_id').notNull(),
  courseId: text('course_id').notNull(),
  lastItemId: text('last_item_id').notNull(),
  lastStepId: text('last_step_id').notNull(),
  lastVisitedAt: timestamp('last_visited_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const userSettings = pgTable('user_settings', {
  id: text('id').primaryKey(), // Same as userId (1:1 relationship)
  userId: text('user_id').notNull().unique(),
  aiProvider: text('ai_provider'), // 'openai' | 'anthropic' | 'ollama'
  aiModel: text('ai_model'),
  // API key is encrypted with a per-user encryption key
  encryptedApiKey: text('encrypted_api_key'),
  // Per-user encryption key (encrypted with master key)
  keyEncryptionKey: text('key_encryption_key'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const stepChats = pgTable('step_chats', {
  id: text('id').primaryKey(), // Composite: userId:courseId:itemId:stepId
  userId: text('user_id').notNull(),
  courseId: text('course_id').notNull(),
  itemId: text('item_id').notNull(),
  stepId: text('step_id').notNull(),
  messages: jsonb('messages').notNull().default('[]'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Relations (for joins)
export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  // Note: user table is managed by better-auth, we reference it here for type safety
}))

// Types
export type StepProgress = typeof stepProgress.$inferSelect
export type NewStepProgress = typeof stepProgress.$inferInsert

export type LessonProgress = typeof lessonProgress.$inferSelect
export type NewLessonProgress = typeof lessonProgress.$inferInsert

export type CourseVisit = typeof courseVisits.$inferSelect
export type NewCourseVisit = typeof courseVisits.$inferInsert

export type UserSettings = typeof userSettings.$inferSelect
export type NewUserSettings = typeof userSettings.$inferInsert

export type StepChat = typeof stepChats.$inferSelect
export type NewStepChat = typeof stepChats.$inferInsert
