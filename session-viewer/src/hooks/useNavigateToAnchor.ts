import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export function useNavigateToAnchor() {
  const navigate = useNavigate()

  const navigateToAnchor = useCallback(
    (anchorId: string) => {
      // Update URL with hash
      navigate(`#${anchorId}`, { replace: true })

      // Scroll to element
      const element = document.getElementById(anchorId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    },
    [navigate]
  )

  return navigateToAnchor
}
