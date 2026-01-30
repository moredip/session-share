import { AnchorLink } from './AnchorLink'

type ColorVariant = 'sky' | 'custard' | 'gray'

const variantStyles: Record<ColorVariant, { header: string; border: string; body: string }> = {
  sky: {
    header: 'bg-sky-500 text-white',
    border: 'border-sky-300',
    body: 'bg-sky-50',
  },
  custard: {
    header: 'bg-custard-500 text-white',
    border: 'border-custard-300',
    body: 'bg-custard-50',
  },
  gray: {
    header: 'bg-custard-200 text-custard-700',
    border: 'border-custard-100',
    body: 'bg-custard-50/50',
  },
}

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
