export type ColorVariant = 'sky' | 'custard' | 'gray'

export const variantStyles: Record<
  ColorVariant,
  { header: string; headerHover: string; border: string; body: string }
> = {
  sky: {
    header: 'bg-sky-500 text-white',
    headerHover: 'hover:bg-sky-600',
    border: 'border-sky-300',
    body: 'bg-sky-50',
  },
  custard: {
    header: 'bg-custard-500 text-white',
    headerHover: 'hover:bg-custard-600',
    border: 'border-custard-300',
    body: 'bg-custard-50',
  },
  gray: {
    header: 'bg-custard-200 text-custard-700',
    headerHover: 'hover:bg-custard-300',
    border: 'border-custard-100',
    body: 'bg-custard-50/50',
  },
}
