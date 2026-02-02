import { Link } from "@tanstack/react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FolderCog as FolderCode } from "lucide-react"
import type { Course } from "@/lib/course-data"

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  const lessonCount = course.items.filter((item) => item.type === "lesson").length
  const projectCount = course.items.filter((item) => item.type === "project").length
  const firstItem = course.items[0]
  const firstStep = firstItem?.steps[0]

  return (
    <Link to={firstStep ? `/course/${course.id}/${firstItem.id}/${firstStep.id}` : "#"}>
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5">
        <CardHeader>
          <CardTitle className="text-xl">{course.title}</CardTitle>
          <CardDescription>{course.description}</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </Link>
  )
}
