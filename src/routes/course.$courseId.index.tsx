import { createFileRoute, notFound, Link } from "@tanstack/react-router"
import { loadCourse } from "@/lib/course-data"
import { CourseProgressBar } from "@/components/course-progress-bar"
import { CourseOutline } from "@/components/course-outline"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useLastVisit, useNextIncompleteStep } from "@/lib/progress-hooks"

export const Route = createFileRoute("/course/$courseId/")({
  component: CourseIndexPage,
  loader: async ({ params }) => {
    const course = await loadCourse({ data: { courseId: params.courseId } })
    if (!course) throw notFound()
    return { course }
  },
})

function CourseIndexPage() {
  const { courseId } = Route.useParams()
  const { course } = Route.useLoaderData()

  const lastVisit = useLastVisit(courseId)
  const nextIncomplete = useNextIncompleteStep(courseId, course)

  // Determine where "Continue Learning" should go
  const continueTarget = lastVisit
    ? { itemId: lastVisit.lastItemId, stepId: lastVisit.lastStepId }
    : nextIncomplete

  // Get first step as fallback
  const firstStep =
    course.items.length > 0 && course.items[0].steps.length > 0
      ? { itemId: course.items[0].id, stepId: course.items[0].steps[0].id }
      : null

  const targetStep = continueTarget || firstStep

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block mb-4"
          >
            ← All Courses
          </Link>
          <h1 className="text-4xl font-bold mb-3">{course.title}</h1>
          <p className="text-lg text-muted-foreground">{course.description}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Progress Section */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <CourseProgressBar courseId={courseId} course={course} variant="full" />
          {targetStep && (
            <Link to={`/course/${courseId}/${targetStep.itemId}/${targetStep.stepId}`}>
              <Button size="lg" className="w-full sm:w-auto gap-2">
                {lastVisit ? "Continue Learning" : "Start Course"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Course Outline */}
        <CourseOutline course={course} />
      </main>
    </div>
  )
}
