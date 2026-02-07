import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import type { Step } from '@/lib/course-data'
import { useStepCompletion } from '@/lib/progress-hooks'

interface StepNavigationProps {
  courseId: string
  itemId: string
  steps: Step[]
  currentStepId: string
}

export function StepNavigation({
  courseId,
  itemId,
  steps,
  currentStepId,
}: StepNavigationProps) {
  const navigate = useNavigate()
  const currentIndex = steps.findIndex((s) => s.id === currentStepId)
  const prevStep = currentIndex > 0 ? steps[currentIndex - 1] : null
  const nextStep =
    currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null

  const { isComplete, markComplete } = useStepCompletion(
    courseId,
    itemId,
    currentStepId,
  )

  const handleNextClick = async () => {
    // Mark the current step as complete
    await markComplete()
    // Navigate to the next step
    if (nextStep) {
      navigate({
        to: '/course/$courseId/$itemId/$stepId',
        params: { courseId, itemId, stepId: nextStep.id },
      })
    }
  }

  return (
    <div className="flex items-center justify-between">
      {prevStep ? (
        <Link
          to="/course/$courseId/$itemId/$stepId"
          params={{ courseId, itemId, stepId: prevStep.id }}
        >
          <Button variant="outline" className="gap-2 bg-transparent">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{prevStep.title}</span>
            <span className="sm:hidden">Previous</span>
          </Button>
        </Link>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {isComplete && <CheckCircle className="h-4 w-4 text-primary" />}
        <span>
          Step {currentIndex + 1} of {steps.length}
        </span>
      </div>

      {nextStep ? (
        <Button className="gap-2" onClick={handleNextClick}>
          <span className="hidden sm:inline">{nextStep.title}</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <div />
      )}
    </div>
  )
}
