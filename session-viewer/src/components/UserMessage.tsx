import ReactMarkdown from 'react-markdown'

interface UserMessageProps {
  content: string
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-lg px-4 py-2 bg-blue-600 text-white">
        <div className="text-xs opacity-60 mb-1">User</div>
        <div className="prose prose-sm max-w-none prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
