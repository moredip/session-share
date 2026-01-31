interface CodeBlockProps {
  children: React.ReactNode
  wrap?: boolean
}

export function CodeBlock({ children, wrap = true }: CodeBlockProps) {
  return (
    <pre
      className={`text-xs bg-gray-50 p-3 overflow-x-auto border border-gray-200${wrap ? ' whitespace-pre-wrap' : ''}`}
    >
      {children}
    </pre>
  )
}
