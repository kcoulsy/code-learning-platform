import { useStepCompletion } from "@/lib/progress-hooks"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface StepCompletionToggleProps {
  courseId: string
  itemId: string
  stepId: string
}

export function StepCompletionToggle({
  courseId,
  itemId,
  stepId,
}: StepCompletionToggleProps) {
  const { isComplete, toggle } = useStepCompletion(courseId, itemId, stepId)

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={`step-complete-${stepId}`}
        checked={isComplete}
        onCheckedChange={toggle}
        aria-label="Mark step as complete"
      />
      <Label
        htmlFor={`step-complete-${stepId}`}
        className="text-sm font-medium cursor-pointer select-none"
      >
        Mark as complete
      </Label>
    </div>
  )
}
