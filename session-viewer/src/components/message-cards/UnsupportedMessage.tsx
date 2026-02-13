import { MessageCard } from './MessageCard'

interface UnsupportedMessageProps {
  originalType: string
  raw: unknown
  anchorId: string
}

export function UnsupportedMessage({ originalType, raw, anchorId }: UnsupportedMessageProps) {
  return (
    <MessageCard anchorId={anchorId} label="Unsupported" align="left" variant="gray">
      <p className="text-gray-400 text-sm italic mb-3">
        Unsupported message type: "{originalType}"
      </p>
      <pre className="text-xs bg-gray-50 p-3 overflow-x-auto border border-gray-200">
        {JSON.stringify(raw, null, 2)}
      </pre>
    </MessageCard>
  )
}
