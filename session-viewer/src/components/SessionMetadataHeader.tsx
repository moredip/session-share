import { useState } from 'react'
import type { SessionMetadata } from '../domain/transcriptEntry'

function formatStartTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDuration(startIso: string, endIso: string): string {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime()
  if (ms < 60_000) return '< 1 min'
  const totalMinutes = Math.floor(ms / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
}

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span>
      <span className="text-gray-400">{label}: </span>
      {children}
    </span>
  )
}

function CopyableId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false)
  const short = id.slice(0, 8)

  function handleCopy() {
    const resumeCommand = `claude --resume ${id}`
    navigator.clipboard.writeText(resumeCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-mono">{short}…</span>
      <button
        onClick={handleCopy}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        title="Copy claude --resume command"
        aria-label="Copy claude --resume command"
      >
        {copied ? (
          <svg
            className="w-3.5 h-3.5 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>
    </span>
  )
}

interface Props {
  metadata: SessionMetadata
}

export function SessionMetadataHeader({ metadata }: Props) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500 border-b border-gray-100 mb-4 pb-3">
      {metadata.gitBranch && (
        <span className="inline-flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
            <path d="M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.493 2.493 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Z" />
          </svg>
          <span className="font-mono">{metadata.gitBranch}</span>
        </span>
      )}
      <MetaItem label="Started">{formatStartTime(metadata.startTime)}</MetaItem>
      <MetaItem label="Duration">
        <span
          title={`Ended: ${formatStartTime(metadata.endTime)}`}
          className="underline decoration-dotted decoration-gray-300 cursor-default"
        >
          {formatDuration(metadata.startTime, metadata.endTime)}
        </span>
      </MetaItem>
      <MetaItem label="User messages">{metadata.userMessageCount}</MetaItem>
      <MetaItem label="Session">
        <CopyableId id={metadata.sessionId} />
      </MetaItem>
    </div>
  )
}
