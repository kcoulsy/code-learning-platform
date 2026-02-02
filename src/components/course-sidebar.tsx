import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import type { Course, CourseItem } from "@/lib/course-data"
import { BookOpen, FolderCog as FolderCode, ChevronRight, ChevronDown } from "lucide-react"
import { useState } from "react"

interface CourseSidebarProps {
  course: Course
  currentItemId?: string
  currentStepId?: string
}

function CourseItemEntry({
  item,
  courseId,
  isActive,
  currentStepId,
}: {
  item: CourseItem
  courseId: string
  isActive: boolean
  currentStepId?: string
}) {
  const [isExpanded, setIsExpanded] = useState(isActive)
  const Icon = item.type === "lesson" ? BookOpen : FolderCode

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors",
          isActive
            ? "bg-accent text-accent-foreground font-medium"
            : "hover:bg-secondary text-muted-foreground hover:text-foreground"
        )}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0" />
        )}
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.title}</span>
        {item.type === "project" && (
          <span className="ml-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
            Project
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="ml-6 mt-1 space-y-0.5 border-l border-border pl-3">
          {item.steps.map((step, index) => (
            <Link
              key={step.id}
              to={`/course/${courseId}/${item.id}/${step.id}`}
              className={cn(
                "block px-3 py-1.5 rounded-md text-sm transition-colors",
                currentStepId === step.id
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <span className="text-xs text-muted-foreground mr-2">
                {index + 1}.
              </span>
              {step.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function CourseSidebar({
  course,
  currentItemId,
  currentStepId,
}: CourseSidebarProps) {
  return (
    <aside className="w-72 border-r border-border bg-sidebar h-screen overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b border-border">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          All Courses
        </Link>
        <h2 className="font-semibold text-lg text-sidebar-foreground mt-1">
          {course.title}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {course.description}
        </p>
      </div>

      <nav className="p-3">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
          Course Outline
        </div>
        {course.items.map((item) => (
          <CourseItemEntry
            key={item.id}
            item={item}
            courseId={course.id}
            isActive={item.id === currentItemId}
            currentStepId={currentStepId}
          />
        ))}
      </nav>
    </aside>
  )
}
