'use client'

import { ExerciseCard, Exercise } from './exercise-card'
import { useExerciseProgress } from '@/hooks/use-exercise-progress'

interface ExerciseListProps {
  content: string
  title: string
  stepId: string
}

function parseExercise(content: string): Exercise {
  const lines = content.split('\n')
  let description: string[] = []
  let hint: string[] = []
  let solution: string[] = []

  let currentSection: 'description' | 'hint' | 'solution' | null = null
  let buffer: string[] = []

  const saveBuffer = () => {
    if (buffer.length > 0) {
      const text = buffer.join('\n').trim()
      if (currentSection === 'description') {
        description.push(text)
      } else if (currentSection === 'hint') {
        hint.push(text)
      } else if (currentSection === 'solution') {
        solution.push(text)
      }
      buffer = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed === '<hint>') {
      saveBuffer()
      currentSection = 'hint'
    } else if (trimmed === '</hint>') {
      saveBuffer()
      currentSection = null
    } else if (trimmed === '<solution>') {
      saveBuffer()
      currentSection = 'solution'
    } else if (trimmed === '</solution>') {
      saveBuffer()
      currentSection = null
    } else if (currentSection) {
      buffer.push(line)
    } else if (trimmed) {
      // This is the description (before any tags)
      if (!currentSection) {
        currentSection = 'description'
      }
      buffer.push(line)
    }
  }

  saveBuffer()

  return {
    title: '', // Will be set by parent
    description: description.join('\n\n'),
    hint: hint.join('\n') || undefined,
    solution: solution.join('\n') || undefined,
  }
}

export function ExerciseList({ content, title, stepId }: ExerciseListProps) {
  const { isComplete, toggleComplete, isLoaded } = useExerciseProgress(stepId)

  const exercise = parseExercise(content)
  exercise.title = title

  if (!isLoaded) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-muted rounded-xl" />
      </div>
    )
  }

  return (
    <div className="my-6">
      <ExerciseCard
        exercise={exercise}
        index={0}
        isComplete={isComplete(0)}
        onToggleComplete={() => toggleComplete(0)}
      />
    </div>
  )
}
