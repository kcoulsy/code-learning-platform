# Course Content Structure

This directory contains all course content in MDX format with frontmatter metadata.

## Directory Structure

```
content/
├── {course-id}/
│   ├── course.mdx              # Course introduction and metadata
│   └── lessons/
│       └── {lesson-id}/
│           ├── lesson.mdx      # Lesson metadata and description
│           └── steps/
│               └── {step-id}/
│                   └── step.mdx  # Step content
```

## Example Structure

```
content/
├── learning-c/
│   ├── course.mdx
│   └── lessons/
│       ├── intro-to-c/
│       │   ├── lesson.mdx
│       │   └── steps/
│       │       ├── what-is-c/
│       │       │   └── step.mdx
│       │       ├── setting-up/
│       │       │   └── step.mdx
│       │       └── first-program/
│       │           └── step.mdx
│       └── variables-data-types/
│           ├── lesson.mdx
│           └── steps/
│               ├── what-are-variables/
│               │   └── step.mdx
│               └── basic-data-types/
│                   └── step.mdx
```

## File Formats

### course.mdx

Course introduction file with metadata:

```mdx
---
id: course-id
title: Course Title
description: Course description
---

# Course Title

Course introduction content in Markdown...
```

### lesson.mdx

Lesson metadata file:

```mdx
---
id: lesson-id
title: Lesson Title
description: Lesson description
type: lesson
order: 1
---

# Lesson Title

Optional lesson introduction content...
```

### step.mdx

Individual step content:

```mdx
---
id: step-id
title: Step Title
order: 1
---

# Step Title

Step content in Markdown...

- Code examples
- Explanations
- Exercises
```

## Metadata Fields

### Course Metadata
- `id` (required): Unique course identifier
- `title` (required): Course display title
- `description` (required): Brief course description

### Lesson Metadata
- `id` (required): Unique lesson identifier within the course
- `title` (required): Lesson display title
- `description` (required): Brief lesson description
- `type` (required): Either "lesson" or "project"
- `order` (optional): Numeric order for sorting (default: 0)

### Step Metadata
- `id` (required): Unique step identifier within the lesson
- `title` (required): Step display title
- `order` (optional): Numeric order for sorting (default: 0)

## Adding New Content

### Adding a New Course

1. Create a new directory: `content/{course-id}/`
2. Add `course.mdx` with course metadata
3. Create `lessons/` directory
4. Add lessons following the lesson structure

### Adding a New Lesson

1. Create directory: `content/{course-id}/lessons/{lesson-id}/`
2. Add `lesson.mdx` with lesson metadata
3. Create `steps/` directory
4. Add steps following the step structure

### Adding a New Step

1. Create directory: `content/{course-id}/lessons/{lesson-id}/steps/{step-id}/`
2. Add `step.mdx` with step content and metadata

## Benefits of This Structure

- **Separation of concerns**: Content is separated from code
- **Version control friendly**: Each file can be tracked independently
- **Easy to edit**: Content creators can focus on MDX files
- **Scalable**: Easy to add new courses, lessons, and steps
- **Flexible metadata**: Frontmatter can be extended with additional fields
- **Rich content**: Full MDX/Markdown support for formatting, code blocks, etc.
