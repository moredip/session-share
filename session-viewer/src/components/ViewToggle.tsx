export type ViewMode = 'conversation' | 'raw'

interface ViewToggleProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => onViewChange('conversation')}
        className={`px-3 py-1.5 text-sm font-medium transition-colors ${
          currentView === 'conversation'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Conversation
      </button>
      <button
        onClick={() => onViewChange('raw')}
        className={`px-3 py-1.5 text-sm font-medium transition-colors ${
          currentView === 'raw'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Raw
      </button>
    </div>
  )
}
