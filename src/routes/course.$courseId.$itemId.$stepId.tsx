import { createFileRoute, notFound } from '@tanstack/react-router'
import { BookOpen, FolderCog as FolderCode } from 'lucide-react'
import { loadCourse } from '@/lib/course-data'
import { CourseSidebar } from '@/components/course-sidebar'
import { MarkdownContent } from '@/components/markdown-content'
import { StepNavigation } from '@/components/step-navigation'
import { StepChat } from '@/components/step-chat'
import { StepCompletionToggle } from '@/components/step-completion-toggle'
import { CopyContentButton } from '@/components/copy-content-button'
import { useTrackVisit } from '@/lib/progress-hooks'
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import { useIsMobile } from '@/hooks/use-mobile'
import { useSidebarLayout } from '@/hooks/use-sidebar-layout'
import { useEffect, useRef } from 'react'
import { usePanelRef, type ImperativePanelHandle } from 'react-resizable-panels'

export const Route = createFileRoute('/course/$courseId/$itemId/$stepId')({
  component: StepPage,
  loader: async ({ params }) => {
    const course = await loadCourse({ data: { courseId: params.courseId } })
    if (!course) throw notFound()

    const item = course.items.find((i) => i.id === params.itemId)
    if (!item) throw notFound()

    const step = item.steps.find((s) => s.id === params.stepId)
    if (!step) throw notFound()

    return { course, item, step }
  },
})

function DesktopLayout({
  course,
  item,
  step,
  courseId,
  itemId,
  stepId,
  Icon,
  contentRef,
}: {
  course: any
  item: any
  step: any
  courseId: string
  itemId: string
  stepId: string
  Icon: any
  contentRef: React.RefObject<HTMLDivElement | null>
}) {
  const { layout, saveLayout } = useSidebarLayout()
  const { open } = useSidebar()
  const sidebarPanelRef = usePanelRef()

  // Collapse/expand the sidebar panel when the open state changes
  useEffect(() => {
    console.log('Sidebar open state changed:', sidebarPanelRef, open)
    if (sidebarPanelRef.current) {
      if (open) {
        sidebarPanelRef.current.expand()
      } else {
        sidebarPanelRef.current.collapse()
      }
    }
  }, [open])

  return (
    <ResizablePanelGroup
      direction="horizontal"
      onLayout={saveLayout}
      className="flex-1"
    >
      {/* Sidebar panel */}
      <ResizablePanel
        panelRef={sidebarPanelRef}
        defaultSize={layout.sidebarSize}
        minSize={200}
        maxSize={400}
        collapsible={true}
        collapsedSize={0}
        className="min-w-[200px] max-w-[400px]"
      >
        <CourseSidebar
          course={course}
          currentItemId={itemId}
          currentStepId={stepId}
        />
      </ResizablePanel>

      {/* Resize handle */}
      <ResizableHandle withHandle />

      {/* Main content panel */}
      <ResizablePanel defaultSize={layout.mainSize} minSize={50}>
        <main className="flex-1 flex flex-col h-full">
          <div className="flex items-center justify-between gap-2 p-2 border-b border-border">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
                <span>/</span>
                <span className="text-foreground font-medium">
                  {step.title}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CopyContentButton content={step.content} />
              <StepCompletionToggle
                courseId={courseId}
                itemId={itemId}
                stepId={stepId}
                key={`${courseId}-${itemId}-${stepId}`}
              />
            </div>
          </div>
          <div ref={contentRef} className="flex-1 overflow-y-auto pb-10">
            <div className="max-w-3xl mx-auto px-8 py-12 pb-0">
              <MarkdownContent
                content={step.content}
                stepId={`${courseId}-${itemId}-${stepId}`}
              />
            </div>
          </div>
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
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

function StepPage() {
  const { courseId, itemId, stepId } = Route.useParams()
  const { course, item, step } = Route.useLoaderData()
  const isMobile = useIsMobile()
  const contentRef = useRef<HTMLDivElement>(null)

  // Track visit for "Continue Learning" functionality
  useTrackVisit(courseId, itemId, stepId)

  // Scroll to top when step changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
  }, [stepId])

  const Icon = item.type === 'lesson' ? BookOpen : FolderCode

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen bg-background w-full">
        {isMobile ? (
          // Simple layout for mobile
          <>
            <CourseSidebar
              course={course}
              currentItemId={itemId}
              currentStepId={stepId}
              useSidebarWrapper={true}
            />

            <main className="flex-1 flex flex-col">
              <div className="flex items-center justify-between gap-2 p-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    <span>/</span>
                    <span className="text-foreground font-medium">
                      {step.title}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CopyContentButton content={step.content} />
                  <StepCompletionToggle
                    courseId={courseId}
                    itemId={itemId}
                    stepId={stepId}
                    key={`${courseId}-${itemId}-${stepId}`}
                  />
                </div>
              </div>
              <div ref={contentRef} className="flex-1 overflow-y-auto pb-10">
                <div className="max-w-3xl mx-auto px-8 py-12 pb-0">
                  <MarkdownContent
                    content={step.content}
                    stepId={`${courseId}-${itemId}-${stepId}`}
                  />
                </div>
              </div>
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
          </>
        ) : (
          // Resizable panels for desktop
          <DesktopLayout
            course={course}
            item={item}
            step={step}
            courseId={courseId}
            itemId={itemId}
            stepId={stepId}
            Icon={Icon}
            contentRef={contentRef}
          />
        )}

        {/* AI Chat - remains floating outside panel group */}
        <StepChat
          key={`chat-${courseId}-${itemId}-${stepId}`}
          courseId={courseId}
          itemId={itemId}
          stepId={stepId}
          stepTitle={step.title}
          stepContent={step.content}
        />
      </div>
    </SidebarProvider>
  )
}
