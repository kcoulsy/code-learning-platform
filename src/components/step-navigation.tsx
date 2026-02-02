import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Step } from "@/lib/course-data"

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

  return (
    <div className="flex items-center justify-between mt-12 pt-6 border-t border-border">
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

      <div className="text-sm text-muted-foreground">
        Step {currentIndex + 1} of {steps.length}
      </div>

      {nextStep ? (
        <Link to={`/course/${courseId}/${itemId}/${nextStep.id}`}>
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
