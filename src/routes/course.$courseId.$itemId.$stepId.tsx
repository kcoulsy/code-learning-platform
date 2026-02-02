import { createFileRoute, notFound } from "@tanstack/react-router";
import { BookOpen, FolderCog as FolderCode } from "lucide-react";
import { loadCourse } from "@/lib/course-data";
import { CourseSidebar } from "@/components/course-sidebar";
import { MarkdownContent } from "@/components/markdown-content";
import { StepNavigation } from "@/components/step-navigation";
import { StepChat } from "@/components/step-chat";
import { StepCompletionToggle } from "@/components/step-completion-toggle";
import { useTrackVisit } from "@/lib/progress-hooks";

export const Route = createFileRoute("/course/$courseId/$itemId/$stepId")({
  component: StepPage,
  loader: async ({ params }) => {
    const course = await loadCourse({ data: { courseId: params.courseId } });
    if (!course) throw notFound();

    const item = course.items.find((i) => i.id === params.itemId);
    if (!item) throw notFound();

    const step = item.steps.find((s) => s.id === params.stepId);
    if (!step) throw notFound();

    return { course, item, step };
  },
});

function StepPage() {
  const { courseId, itemId, stepId } = Route.useParams();
  const { course, item, step } = Route.useLoaderData();

  // Track visit for "Continue Learning" functionality
  useTrackVisit(courseId, itemId, stepId);

  const Icon = item.type === "lesson" ? BookOpen : FolderCode;

  return (
    <div className="flex h-screen bg-background">
      <CourseSidebar
        course={course}
        currentItemId={itemId}
        currentStepId={stepId}
      />

      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto pb-10">
          <div className="max-w-3xl mx-auto px-8 py-12 pb-0">
            {/* Header with breadcrumb and completion toggle */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
                <span>/</span>
                <span className="text-foreground font-medium">{step.title}</span>
              </div>
              <StepCompletionToggle
                courseId={courseId}
                itemId={itemId}
                stepId={stepId}
                key={`${courseId}-${itemId}-${stepId}`}
              />
            </div>

            {/* Content */}
            <MarkdownContent content={step.content} />
          </div>
        </div>

        {/* Fixed Bottom Navigation Bar */}
        <div className="border-t border-border bg-background">
          <div className="max-w-3xl mx-auto px-8 py-4">
            <StepNavigation
              courseId={courseId}
              itemId={itemId}
              steps={item.steps}
              currentStepId={stepId}
            />
          </div>
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
