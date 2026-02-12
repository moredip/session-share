import { useEffect, useMemo, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { extractSessionMetadata } from '../domain/transcriptEntry'
import { fetchGistTranscriptFull, type TranscriptData } from '../lib/gistGateway'
import { MessageThread } from './MessageThread'
import { RawTranscriptView } from './RawTranscriptView'
import { SessionMetadataHeader } from './SessionMetadataHeader'
import { ViewToggle, type ViewMode } from './ViewToggle'

export function TranscriptViewer() {
  const { gistId } = useParams<{ gistId: string }>()
  const location = useLocation()
  const [data, setData] = useState<TranscriptData | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('conversation')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!gistId) return

    async function loadTranscript() {
      try {
        setLoading(true)
        setError(null)
        const transcriptData = await fetchGistTranscriptFull(gistId!)
        setData(transcriptData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transcript')
      } finally {
        setLoading(false)
      }
    }

    loadTranscript()
  }, [gistId])

  // Scroll to anchor when data loads and URL has a hash
  useEffect(() => {
    if (data && location.hash) {
      const anchorId = location.hash.slice(1) // Remove #
      const element = document.getElementById(anchorId)
      if (element) {
        // Small delay to ensure DOM is fully rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    }
  }, [data, location.hash])

  const metadata = useMemo(() => (data ? extractSessionMetadata(data.entries) : null), [data])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading transcript...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-red-500 max-w-2xl">
          <p className="font-medium">Error loading transcript</p>
          <pre className="text-sm mt-2 whitespace-pre-wrap break-words font-mono bg-red-50 p-3 rounded max-h-96 overflow-auto">
            {error}
          </pre>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-gray-700">Session Transcript</h1>
        <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
      </div>
      {metadata && <SessionMetadataHeader metadata={metadata} />}
      {viewMode === 'conversation' ? (
        <MessageThread entries={data.entries} />
      ) : (
        <RawTranscriptView entries={data.entries} />
      )}
    </div>
  )
}
