import type { ImageSource } from '../../domain/transcriptEntry'

interface Base64ImageProps {
  source: ImageSource
  alt: string
}

export function Base64Image({ source, alt }: Base64ImageProps) {
  const src = `data:${source.media_type};base64,${source.data}`
  return (
    <img src={src} alt={alt} className="max-w-full rounded-lg border border-gray-200 shadow-sm" />
  )
}
