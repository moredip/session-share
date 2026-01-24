import { AnchorLink } from './AnchorLink'

interface MessageCardProps {
  anchorId: string
  label: string
  align: 'left' | 'right'
  children: React.ReactNode
}

export function MessageCard({ anchorId, label, align, children }: MessageCardProps) {
  return (
    <div
      id={anchorId}
      className={`group flex ${align === 'right' ? 'justify-end' : 'justify-start'} items-start gap-2`}
    >
      <AnchorLink anchorId={anchorId} />
      <div className="w-[80%] border border-gray-300 overflow-hidden shadow-sm">
        <div className="bg-gray-500 text-white px-4 py-1.5 font-medium">{label}</div>
        <div className="bg-white px-6 py-4">{children}</div>
      </div>
    </div>
  )
}
