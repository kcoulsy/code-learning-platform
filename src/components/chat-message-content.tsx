import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

interface ChatMessageContentProps {
  content: string
}

export function ChatMessageContent({ content }: ChatMessageContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="prose prose-sm dark:prose-invert max-w-none"
      components={{
        // Code blocks with syntax highlighting
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "")
          return !inline && match ? (
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              className="!mt-2 !mb-2 !text-xs !leading-relaxed rounded-md overflow-x-auto max-h-96"
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code
              className="bg-muted px-1 py-0.5 rounded text-xs font-mono before:content-none after:content-none"
              {...props}
            >
              {children}
            </code>
          )
        },
        // Compact headings for chat
        h1: ({ node, ...props }) => (
          <h1 className="text-base font-bold mt-3 mb-2" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-sm font-bold mt-2 mb-1" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-sm font-semibold mt-2 mb-1" {...props} />
        ),
        // Compact lists
        ul: ({ node, ...props }) => (
          <ul className="my-2 ml-4 space-y-1" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="my-2 ml-4 space-y-1" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="text-sm leading-relaxed" {...props} />
        ),
        // Compact paragraphs
        p: ({ node, ...props }) => (
          <p className="my-2 text-sm leading-relaxed" {...props} />
        ),
        // Links
        a: ({ node, ...props }) => (
          <a
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        // Blockquotes
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-2 border-muted-foreground/30 pl-3 italic text-muted-foreground my-2"
            {...props}
          />
        ),
        // Tables (GitHub Flavored Markdown)
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-2">
            <table
              className="min-w-full divide-y divide-border text-xs"
              {...props}
            />
          </div>
        ),
        th: ({ node, ...props }) => (
          <th
            className="px-2 py-1 bg-muted font-semibold text-left"
            {...props}
          />
        ),
        td: ({ node, ...props }) => (
          <td className="px-2 py-1 border-t border-border" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
