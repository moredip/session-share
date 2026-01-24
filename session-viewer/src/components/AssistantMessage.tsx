import ReactMarkdown from 'react-markdown'
import { AnchorLink } from './AnchorLink'

interface AssistantMessageProps {
  content: string
  anchorId: string
}

export function AssistantMessage({ content, anchorId }: AssistantMessageProps) {
  return (
    <div id={anchorId} className="group flex justify-start items-start gap-2">
      <AnchorLink anchorId={anchorId} />
      <div className="max-w-[80%] border border-gray-300 overflow-hidden shadow-sm">
        <div className="bg-gray-500 text-white px-4 py-1.5 font-medium">assistant</div>
        <div className="bg-white px-6 py-4">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
