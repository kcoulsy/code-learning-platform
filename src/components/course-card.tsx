import { Link } from "@tanstack/react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FolderCog as FolderCode, ArrowRight } from "lucide-react"
import type { Course } from "@/lib/course-data"
import { useCourseProgress } from "@/lib/progress-hooks"
import { Button } from "@/components/ui/button"
import { CourseProgressBar } from "@/components/course-progress-bar"

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  const lessonCount = course.items.filter((item) => item.type === "lesson").length
  const projectCount = course.items.filter((item) => item.type === "project").length
  const { percentage } = useCourseProgress(course.id, course)

  return (
    <Link to={`/course/${course.id}`}>
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 flex flex-col">
        <CardHeader className="flex-1">
          <CardTitle className="text-xl">{course.title}</CardTitle>
          <CardDescription>{course.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {percentage > 0 && (
            <CourseProgressBar courseId={course.id} course={course} variant="compact" />
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span>{lessonCount} {lessonCount === 1 ? "Lesson" : "Lessons"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FolderCode className="h-4 w-4" />
              <span>{projectCount} {projectCount === 1 ? "Project" : "Projects"}</span>
            </div>
          </div>
          <Button variant="ghost" className="w-full gap-2 -mx-2">
            {percentage > 0 ? "Continue Learning" : "Start Course"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}
