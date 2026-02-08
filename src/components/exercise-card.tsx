'use client'

import { useState } from 'react'
import {
  ChevronDown,
  Lightbulb,
  Code2,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

export interface Exercise {
  title: string
  description: string
  hint?: string
  solution?: string
}

interface ExerciseCardProps {
  exercise: Exercise
  index: number
  isComplete: boolean
  onToggleComplete: () => void
}

export function ExerciseCard({
  exercise,
  index,
  isComplete,
  onToggleComplete,
}: ExerciseCardProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [hintOpen, setHintOpen] = useState(false)
  const [solutionOpen, setSolutionOpen] = useState(false)

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isComplete && 'border-green-500/30 bg-green-50/10 dark:bg-green-900/10',
      )}
    >
      <CardHeader className="pb-3">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-3 flex-1">
              <Checkbox
                checked={isComplete}
                onCheckedChange={onToggleComplete}
                className={cn(
                  'mt-1',
                  isComplete &&
                    'border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white',
                )}
                aria-label={`Mark exercise ${index + 1} as complete`}
              />
              <CollapsibleTrigger className="flex-1 text-left hover:no-underline group">
                <div className="flex items-center gap-2">
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <CardTitle
                    className={cn(
                      'text-lg',
                      isComplete && 'text-green-700 dark:text-green-400',
                    )}
                  >
                    {exercise.title}
                  </CardTitle>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-muted-foreground transition-transform duration-200 ml-auto',
                      isOpen && 'transform rotate-180',
                    )}
                  />
                </div>
              </CollapsibleTrigger>
            </div>
          </div>

          <CollapsibleContent className="mt-4 space-y-4">
            <CardContent className="px-0 pt-0">
              <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {exercise.description}
              </div>

              {exercise.hint && (
                <div className="mt-4">
                  <Collapsible open={hintOpen} onOpenChange={setHintOpen}>
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors">
                      <Lightbulb className="w-4 h-4" />
                      <span>{hintOpen ? 'Hide hint' : 'Show hint'}</span>
                      <ChevronDown
                        className={cn(
                          'w-3 h-3 transition-transform duration-200',
                          hintOpen && 'transform rotate-180',
                        )}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md text-sm text-amber-800 dark:text-amber-200">
                        {exercise.hint}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}

              {exercise.solution && (
                <div className="mt-4">
                  <Collapsible
                    open={solutionOpen}
                    onOpenChange={setSolutionOpen}
                  >
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                      <Code2 className="w-4 h-4" />
                      <span>
                        {solutionOpen ? 'Hide solution' : 'Show solution'}
                      </span>
                      <ChevronDown
                        className={cn(
                          'w-3 h-3 transition-transform duration-200',
                          solutionOpen && 'transform rotate-180',
                        )}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="rounded-md overflow-hidden border border-border">
                        <pre className="!bg-sidebar !m-0">
                          <code className="language-c">
                            {exercise.solution}
                          </code>
                        </pre>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  )
}
