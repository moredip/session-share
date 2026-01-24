import { Link } from '@geist-ui/icons'
import { useNavigateToAnchor } from '../hooks/useNavigateToAnchor'

interface AnchorLinkProps {
  anchorId: string
}

export function AnchorLink({ anchorId }: AnchorLinkProps) {
  const navigateToAnchor = useNavigateToAnchor()

  return (
    <button
      onClick={() => navigateToAnchor(anchorId)}
      className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 text-gray-600"
      title="Permalink to this point in the session"
    >
      <Link size={14} strokeWidth={3} />
    </button>
  )
}
