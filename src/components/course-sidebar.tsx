import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import type { Course, CourseItem } from "@/lib/course-data"
import { BookOpen, FolderCog as FolderCode, ChevronRight, ChevronDown, CheckCircle } from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "./theme-toggle"
import { CourseProgressBar } from "./course-progress-bar"
import { useStepCompletion } from "@/lib/progress-hooks"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

interface CourseSidebarProps {
  course: Course
  currentItemId?: string
  currentStepId?: string
}

function StepEntry({
  step,
  courseId,
  itemId,
  stepId,
  index,
}: {
  step: { id: string; title: string }
  courseId: string
  itemId: string
  stepId?: string
  index: number
}) {
  const { isComplete } = useStepCompletion(courseId, itemId, step.id)

  return (
    <Link
      key={step.id}
      to={`/course/${courseId}/${itemId}/${step.id}`}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
        stepId === step.id
          ? "bg-primary text-primary-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      )}
    >
      <span className="text-xs text-muted-foreground mr-2">
        {index + 1}.
      </span>
      <span className="flex-1">{step.title}</span>
      {isComplete && (
        <CheckCircle className="h-3 w-3 text-primary shrink-0" />
      )}
    </Link>
  )
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
            <StepEntry
              key={step.id}
              step={step}
              courseId={courseId}
              itemId={item.id}
              stepId={currentStepId}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Sidebar content component (can be used with or without Sidebar wrapper)
function CourseSidebarContent({
  course,
  currentItemId,
  currentStepId,
}: CourseSidebarProps) {
  return (
    <>
      <div className="p-4 border-b border-border space-y-3">
        <div>
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
        <CourseProgressBar courseId={course.id} course={course} variant="compact" />
      </div>

      <div className="p-3 flex-1 overflow-y-auto">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
          Course Outline
        </div>
        <div className="space-y-1">
          {course.items.map((item) => (
            <CourseItemEntry
              key={item.id}
              item={item}
              courseId={course.id}
              isActive={item.id === currentItemId}
              currentStepId={currentStepId}
            />
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-border">
        <ThemeToggle />
      </div>
    </>
  )
}

// Main component with two modes: wrapped in Sidebar (mobile) or plain (desktop with ResizablePanel)
export function CourseSidebar({
  course,
  currentItemId,
  currentStepId,
  useSidebarWrapper = false,
}: CourseSidebarProps & { useSidebarWrapper?: boolean }) {
  if (useSidebarWrapper) {
    return (
      <Sidebar collapsible="offcanvas" variant="sidebar">
        <SidebarHeader className="p-4 border-b border-border space-y-3">
          <div>
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
          <CourseProgressBar courseId={course.id} course={course} variant="compact" />
        </SidebarHeader>

        <SidebarContent className="p-3">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Course Outline
          </div>
          <SidebarMenu>
            {course.items.map((item) => (
              <SidebarMenuItem key={item.id}>
                <CourseItemEntry
                  item={item}
                  courseId={course.id}
                  isActive={item.id === currentItemId}
                  currentStepId={currentStepId}
                />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-3 border-t border-border">
          <ThemeToggle />
        </SidebarFooter>
      </Sidebar>
    )
  }

  return (
    <aside className="w-full border-r border-border bg-sidebar h-full flex-shrink-0 flex flex-col">
      <CourseSidebarContent
        course={course}
        currentItemId={currentItemId}
        currentStepId={currentStepId}
      />
    </aside>
  )
}
