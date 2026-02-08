'use client'

import { ExerciseCard, Exercise } from './exercise-card'
import { useExerciseProgress } from '@/hooks/use-exercise-progress'

interface ExerciseListProps {
  content: string
  stepId: string
}

function parseExercises(content: string): Exercise[] {
  const exercises: Exercise[] = []
  const lines = content.split('\n')
  let currentExercise: Partial<Exercise> = {}
  let currentSection: 'description' | 'hint' | 'solution' | null = null
  let buffer: string[] = []

  const saveBuffer = () => {
    if (buffer.length > 0) {
      const text = buffer.join('\n').trim()
      if (currentSection === 'description') {
        currentExercise.description = text
      } else if (currentSection === 'hint') {
        currentExercise.hint = text
      } else if (currentSection === 'solution') {
        currentExercise.solution = text
      }
      buffer = []
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('<hint>')) {
      saveBuffer()
      currentSection = 'hint'
      buffer.push(trimmed.replace('<hint>', '').trim())
    } else if (trimmed === '</hint>') {
      saveBuffer()
      currentSection = null
    } else if (trimmed.startsWith('<solution>')) {
      saveBuffer()
      currentSection = 'solution'
      buffer.push(trimmed.replace('<solution>', '').trim())
    } else if (trimmed === '</solution>') {
      saveBuffer()
      currentSection = null
    } else if (trimmed.startsWith('```')) {
      // Skip code fence markers
      continue
    } else {
      if (currentSection) {
        buffer.push(line)
      } else if (trimmed) {
        // This is the description
        currentSection = 'description'
        buffer.push(line)
      }
    }
  }

  saveBuffer()

  // Check if we have any exercise data
  if (
    currentExercise.description ||
    currentExercise.hint ||
    currentExercise.solution
  ) {
    exercises.push(currentExercise as Exercise)
  }

  return exercises
}

export function ExerciseList({ content, stepId }: ExerciseListProps) {
  const { isComplete, toggleComplete, isLoaded } = useExerciseProgress(stepId)

  // Split content by exercise markers
  const exerciseBlocks = content.split(/```exercise/).filter(Boolean)

  const exercises: Exercise[] = []

  for (const block of exerciseBlocks) {
    // Extract title from first line if it has title="..."
    const titleMatch = block.match(/title="([^"]+)"/)
    const title = titleMatch ? titleMatch[1] : 'Exercise'

    // Remove title line from content
    const contentWithoutTitle = block.replace(/title="[^"]+"/, '').trim()

    // Remove trailing ```
    const cleanContent = contentWithoutTitle.replace(/\n```$/, '').trim()

    const parsed = parseExercises(cleanContent)
    if (parsed.length > 0) {
      exercises.push({
        ...parsed[0],
        title,
      })
    }
  }

  if (exercises.length === 0) {
    return null
  }

  if (!isLoaded) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 my-6">
      {exercises.map((exercise, index) => (
        <ExerciseCard
          key={index}
          exercise={exercise}
          index={index}
          isComplete={isComplete(index)}
          onToggleComplete={() => toggleComplete(index)}
        />
      ))}
    </div>
  )
}
