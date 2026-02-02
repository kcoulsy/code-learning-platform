import { createFileRoute } from "@tanstack/react-router";
import { courses } from "@/lib/course-data";
import { CourseCard } from "@/components/course-card";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">LearnCode</h1>
              <p className="text-sm text-muted-foreground">
                Master programming with focused, step-by-step courses
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Your Courses
          </h2>
          <p className="text-muted-foreground">
            Select a course to continue learning
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No courses available yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
