import { createFileRoute, notFound } from "@tanstack/react-router";
import { getCourse, getCourseItem, getStep } from "@/lib/course-data";
import { CourseSidebar } from "@/components/course-sidebar";
import { MarkdownContent } from "@/components/markdown-content";
import { StepNavigation } from "@/components/step-navigation";
import { StepChat } from "@/components/step-chat";
import { BookOpen, FolderCog as FolderCode } from "lucide-react";

export const Route = createFileRoute("/course/$courseId/$itemId/$stepId")({
  component: StepPage,
});

function StepPage() {
  const { courseId, itemId, stepId } = Route.useParams();

  const course = getCourse(courseId);
  if (!course) throw notFound();

  const item = getCourseItem(courseId, itemId);
  if (!item) throw notFound();

  const step = getStep(courseId, itemId, stepId);
  if (!step) throw notFound();

  const Icon = item.type === "lesson" ? BookOpen : FolderCode;

  return (
    <div className="flex min-h-screen bg-background">
      <CourseSidebar
        course={course}
        currentItemId={itemId}
        currentStepId={stepId}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Icon className="h-4 w-4" />
            <span>{item.title}</span>
            <span>/</span>
            <span className="text-foreground font-medium">{step.title}</span>
          </div>

          {/* Content */}
          <MarkdownContent content={step.content} />

          {/* Navigation */}
          <StepNavigation
            courseId={courseId}
            itemId={itemId}
            steps={item.steps}
            currentStepId={stepId}
          />
        </div>
      </main>

      {/* AI Chat */}
      <StepChat
        courseId={courseId}
        itemId={itemId}
        stepId={stepId}
        stepTitle={step.title}
        stepContent={step.content}
      />
    </div>
  );
}
