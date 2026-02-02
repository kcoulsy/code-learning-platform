import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
import type { Step } from "@/lib/course-data"
import { useStepCompletion } from "@/lib/progress-hooks"

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
  const currentIndex = steps.findIndex((s) => s.id === currentStepId)
  const prevStep = currentIndex > 0 ? steps[currentIndex - 1] : null
  const nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null

  const { isComplete, markComplete } = useStepCompletion(courseId, itemId, currentStepId)

  return (
    <div className="flex items-center justify-between">
      {prevStep ? (
        <Link to={`/course/${courseId}/${itemId}/${prevStep.id}`}>
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
        <span>Step {currentIndex + 1} of {steps.length}</span>
      </div>

      {nextStep ? (
        <Link to={`/course/${courseId}/${itemId}/${nextStep.id}`} onClick={markComplete}>
          <Button className="gap-2">
            <span className="hidden sm:inline">{nextStep.title}</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}
