import { Link } from "@tanstack/react-router"
import { BookOpen, FolderCog as FolderCode, CheckCircle, Circle } from "lucide-react"
import type { Course, CourseItem } from "@/lib/course-data"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import {
  useCourseOutlineProgress,
  useStepCompletion,
  useLessonCompletion,
  useAutoLessonComplete,
} from "@/lib/progress-hooks"

interface CourseOutlineProps {
  course: Course
}

function LessonItem({
  item,
  courseId,
}: {
  item: CourseItem
  courseId: string
}) {
  const { isStepComplete, getLessonProgress } = useCourseOutlineProgress(courseId)
  const { isComplete: lessonComplete, toggle: toggleLesson } = useLessonCompletion(
    courseId,
    item.id
  )

  // Auto-complete lesson when all steps are done
  useAutoLessonComplete(courseId, item.id, item.steps.length)

  const Icon = item.type === "lesson" ? BookOpen : FolderCode
  const progress = getLessonProgress(item)

  return (
    <AccordionItem value={item.id} className="border rounded-lg px-4">
      <AccordionTrigger className="hover:no-underline py-4">
        <div className="flex items-center gap-3 flex-1 text-left">
          <Checkbox
            checked={lessonComplete}
            onCheckedChange={(e) => {
              e.stopPropagation()
              toggleLesson()
            }}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Mark ${item.title} as complete`}
            className="shrink-0"
          />
          <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-base">{item.title}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {progress.completed} of {progress.total} steps complete
            </p>
          </div>
          {item.type === "project" && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded shrink-0">
              Project
            </span>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4">
        <div className="space-y-1 ml-9">
          {item.steps.map((step, index) => (
            <StepItem
              key={step.id}
              step={step}
              courseId={courseId}
              itemId={item.id}
              index={index}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

function StepItem({
  step,
  courseId,
  itemId,
  index,
}: {
  step: { id: string; title: string }
  courseId: string
  itemId: string
  index: number
}) {
  const { isComplete, toggle } = useStepCompletion(courseId, itemId, step.id)

  return (
    <div className="flex items-center gap-3 group">
      <Checkbox
        checked={isComplete}
        onCheckedChange={toggle}
        aria-label={`Mark ${step.title} as complete`}
        className="shrink-0"
      />
      <Link
        to={`/course/${courseId}/${itemId}/${step.id}`}
        className={cn(
          "flex-1 py-2 px-3 rounded-md text-sm transition-colors",
          "hover:bg-accent group-hover:bg-accent"
        )}
      >
        <span className="text-muted-foreground mr-2">{index + 1}.</span>
        <span className={cn(isComplete && "text-muted-foreground")}>{step.title}</span>
      </Link>
    </div>
  )
}

export function CourseOutline({ course }: CourseOutlineProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Course Outline</h2>
      <Accordion type="multiple" className="space-y-3">
        {course.items.map((item) => (
          <LessonItem key={item.id} item={item} courseId={course.id} />
        ))}
      </Accordion>
    </div>
  )
}
