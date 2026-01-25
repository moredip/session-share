import { Link } from 'react-router-dom'
import Github from '@geist-ui/icons/github'

export function NavBar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-gray-800 hover:text-gray-600">
          CustardSeed
        </Link>
        <a
          href="https://github.com/moredip/session-share"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-900"
          aria-label="GitHub repository"
        >
          <Github size={24} />
        </a>
      </div>
    </nav>
  )
}
