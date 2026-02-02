import { useCourseProgress } from '@/lib/progress-hooks'
import type { Course } from '@/lib/course-data'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface CourseProgressBarProps {
  courseId: string
  course: Course
  variant?: 'compact' | 'full'
  className?: string
}

export function CourseProgressBar({
  courseId,
  course,
  variant = 'full',
  className,
}: CourseProgressBarProps) {
  const { percentage, completedCount, totalSteps } = useCourseProgress(courseId, course)

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-1.5', className)}>
        <Progress value={percentage} className="h-1.5" />
        <p className="text-xs text-muted-foreground">
          {completedCount} of {totalSteps} steps complete
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Course Progress</span>
        <span className="text-sm text-muted-foreground">{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
      <p className="text-sm text-muted-foreground">
        {completedCount} of {totalSteps} steps complete
      </p>
    </div>
  )
}
