import { Link } from 'react-router-dom'

export function NavBar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="text-xl font-bold text-gray-800 hover:text-gray-600">
          CustardSeed
        </Link>
      </div>
    </nav>
  )
}
