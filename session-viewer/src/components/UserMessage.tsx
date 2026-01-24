import ReactMarkdown from 'react-markdown'

interface UserMessageProps {
  content: string
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] border border-gray-300 overflow-hidden shadow-sm">
        <div className="bg-gray-500 text-white px-4 py-1.5 font-medium">user</div>
        <div className="bg-white px-6 py-4">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
