'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark'
import { cn } from '@/lib/utils'
import { ExerciseList } from './exercise-list'

interface MarkdownContentProps {
  content: string
  className?: string
  stepId?: string
}

// Split content into regular markdown and exercise blocks
function splitContent(content: string) {
  const parts: Array<
    | { type: 'markdown'; content: string }
    | { type: 'exercise'; content: string; title: string }
  > = []

  let lastIndex = 0
  let i = 0

  while (i < content.length) {
    // Look for ```exercise
    const exerciseStart = content.indexOf('```exercise', i)

    if (exerciseStart === -1) {
      // No more exercises
      break
    }

    // Add content before this exercise
    if (exerciseStart > lastIndex) {
      parts.push({
        type: 'markdown',
        content: content.slice(lastIndex, exerciseStart),
      })
    }

    // Parse the exercise header to get the title
    const headerEnd = content.indexOf('\n', exerciseStart)
    const header = content.slice(exerciseStart, headerEnd)
    const titleMatch = header.match(/title="([^"]*)"/)
    const title = titleMatch ? titleMatch[1] : 'Exercise'

    // Find the matching closing ``` by tracking backtick sequences
    let contentStart = headerEnd + 1
    let j = contentStart
    let exerciseEnd = -1

    while (j < content.length) {
      // Look for ``` at the start of a line
      if (
        content.slice(j, j + 3) === '```' &&
        (j === 0 || content[j - 1] === '\n')
      ) {
        // Check if this is the closing of the exercise block
        // by verifying we're not inside a nested code block within <solution>
        const textBefore = content.slice(contentStart, j)
        const solutionStart = textBefore.lastIndexOf('<solution>')
        const solutionEnd = textBefore.lastIndexOf('</solution>')

        if (solutionStart === -1 || solutionEnd > solutionStart) {
          // Not inside a solution block, this is our closing ```
          exerciseEnd = j
          break
        }
      }
      j++
    }

    if (exerciseEnd === -1) {
      // Malformed exercise block, treat as markdown
      parts.push({
        type: 'markdown',
        content: content.slice(exerciseStart),
      })
      break
    }

    // Add the exercise
    parts.push({
      type: 'exercise',
      content: content.slice(contentStart, exerciseEnd).trim(),
      title,
    })

    lastIndex = exerciseEnd + 3
    i = lastIndex
  }

  // Add remaining content after last exercise
  if (lastIndex < content.length) {
    parts.push({
      type: 'markdown',
      content: content.slice(lastIndex),
    })
  }

  // If no exercises found, return entire content as markdown
  if (parts.length === 0) {
    parts.push({
      type: 'markdown',
      content: content,
    })
  }

  return parts
}

export function MarkdownContent({
  content,
  className,
  stepId,
}: MarkdownContentProps) {
  const parts = splitContent(content)

  return (
    <div className={cn('prose prose-slate max-w-none', className)}>
      {parts.map((part, index) => {
        if (part.type === 'exercise') {
          if (!stepId) return null

          // Reconstruct the exercise block with title for parsing
          const exerciseBlock = part.title
            ? `title="${part.title}"\n${part.content}`
            : part.content

          return (
            <ExerciseList
              key={index}
              content={part.content}
              title={part.title}
              stepId={stepId}
            />
          )
        }

        return (
          <ReactMarkdown
            key={index}
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold text-foreground mb-6 mt-0">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-foreground/90 leading-relaxed mb-4">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-2 mb-4 text-foreground/90">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-2 mb-4 text-foreground/90">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-foreground/90">{children}</li>
              ),
              code: ({ className: codeClassName, children, ref, ...props }) => {
                const match = /language-(\w+)/.exec(codeClassName || '')
                const language = match ? match[1] : ''
                const isInline = !codeClassName

                if (isInline) {
                  return (
                    <code
                      className="bg-secondary px-1.5 py-0.5 rounded text-sm font-mono text-foreground"
                      {...props}
                    >
                      {children}
                    </code>
                  )
                }

                return (
                  <SyntaxHighlighter
                    style={oneDark as any}
                    language={language}
                    PreTag="div"
                    className="!rounded-lg !mb-4 !text-sm !border !border-border !bg-sidebar"
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      background: 'var(--sidebar)',
                      borderRadius: '0.5rem',
                    }}
                    codeTagProps={{
                      style: {
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      },
                    }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                )
              },
              pre: ({ children }) => <>{children}</>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full border border-border rounded-lg overflow-hidden">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="bg-secondary px-4 py-2 text-left text-sm font-semibold text-foreground border-b border-border">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-2 text-sm text-foreground/90 border-b border-border">
                  {children}
                </td>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">
                  {children}
                </strong>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              hr: () => <hr className="border-border my-8" />,
            }}
          >
            {part.content}
          </ReactMarkdown>
        )
      })}
    </div>
  )
}
