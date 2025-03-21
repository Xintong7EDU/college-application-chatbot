"use client"

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.css'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

// Define the proper type for the code component props
interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('prose prose-sm dark:prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
        components={{
          h1: ({ className, ...props }) => 
            <h1 className={cn("text-2xl font-bold my-4", className)} {...props} />,
          h2: ({ className, ...props }) => 
            <h2 className={cn("text-xl font-bold my-3", className)} {...props} />,
          h3: ({ className, ...props }) => 
            <h3 className={cn("text-lg font-bold my-2", className)} {...props} />,
          h4: ({ className, ...props }) => 
            <h4 className={cn("text-base font-bold my-2", className)} {...props} />,
          p: ({ className, ...props }) => 
            <p className={cn("mb-4 leading-relaxed", className)} {...props} />,
          ul: ({ className, ...props }) => 
            <ul className={cn("list-disc pl-6 mb-4", className)} {...props} />,
          ol: ({ className, ...props }) => 
            <ol className={cn("list-decimal pl-6 mb-4", className)} {...props} />,
          li: ({ className, ...props }) => 
            <li className={cn("mb-1", className)} {...props} />,
          blockquote: ({ className, ...props }) => 
            <blockquote className={cn("border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-1 my-4 italic", className)} {...props} />,
          a: ({ className, ...props }) => 
            <a className={cn("text-blue-600 dark:text-blue-400 hover:underline", className)} target="_blank" rel="noopener noreferrer" {...props} />,
          table: ({ className, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className={cn("min-w-full divide-y divide-gray-300 dark:divide-gray-700", className)} {...props} />
            </div>
          ),
          thead: ({ className, ...props }) => 
            <thead className={cn("bg-gray-100 dark:bg-gray-800", className)} {...props} />,
          tbody: ({ className, ...props }) => 
            <tbody className={cn("divide-y divide-gray-200 dark:divide-gray-800", className)} {...props} />,
          th: ({ className, ...props }) => 
            <th className={cn("px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", className)} {...props} />,
          td: ({ className, ...props }) => 
            <td className={cn("px-4 py-3 whitespace-nowrap", className)} {...props} />,
          tr: ({ className, ...props }) => 
            <tr className={cn("hover:bg-gray-50 dark:hover:bg-gray-900", className)} {...props} />,
          code: ({ inline, className, ...props }: CodeProps) => {
            const match = /language-(\w+)/.exec(className || '')
            
            if (inline) {
              return (
                <code 
                  className={cn("px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200", className)} 
                  {...props} 
                />
              )
            }
            
            return (
              <div className="relative group">
                <div
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    const code = props.children?.toString() || '';
                    navigator.clipboard.writeText(code.replace(/\n$/, ''));
                  }}
                >
                  <button
                    className="p-1 rounded bg-gray-700 text-gray-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                    aria-label="Copy code"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                      <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                    </svg>
                  </button>
                </div>
                <pre className="p-4 bg-gray-900 rounded-md text-white overflow-x-auto">
                  <code className={match ? `language-${match[1]}` : ''} {...props} />
                </pre>
              </div>
            )
          },
          img: ({ alt, className, ...props }) => 
            <img className={cn("max-w-full h-auto rounded-md my-4", className)} alt={alt || 'Image'} {...props} />,
          hr: ({ className, ...props }) => 
            <hr className={cn("my-6 border-gray-300 dark:border-gray-700", className)} {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
} 