import { AnchorLink } from './AnchorLink'
import { type ColorVariant, variantStyles } from '../styles/cardVariants'

interface MessageCardProps {
  anchorId: string
  label: string
  align: 'left' | 'right'
  variant?: ColorVariant
  children: React.ReactNode
}

export function MessageCard({
  anchorId,
  label,
  align,
  variant = 'gray',
  children,
}: MessageCardProps) {
  const styles = variantStyles[variant]

  return (
    <div
      id={anchorId}
      className={`group flex ${align === 'right' ? 'justify-end' : 'justify-start'} items-start gap-2`}
    >
      <AnchorLink anchorId={anchorId} />
      <div className={`w-[80%] border ${styles.border} overflow-hidden shadow-sm`}>
        <div className={`${styles.header} px-4 py-1.5 font-medium`}>{label}</div>
        <div className={`${styles.body} px-6 py-4`}>{children}</div>
      </div>
    </div>
  )
}
