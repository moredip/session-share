import { Routes, Route } from 'react-router-dom'
import { TranscriptViewer } from './components/TranscriptViewer'

function App() {
  return (
    <Routes>
      <Route path="/g/:gistId" element={<TranscriptViewer />} />
      <Route
        path="/"
        element={
          <div className="p-8">
            <h1 className="text-xl font-semibold mb-4 text-gray-700">Session Viewer</h1>
            <p className="text-gray-600 mb-4">
              View Claude Code session transcripts from GitHub Gists.
            </p>
            <p className="text-gray-600">Examples:</p>
            <ul className="list-disc list-inside text-gray-600">
              <li>
                <a
                  href="/g/45fbc3aaf7337f4fa22d6440b9441ad0"
                  className="text-blue-600 hover:underline"
                >
                  /g/45fbc3aaf7337f4fa22d6440b9441ad0
                </a>
              </li>
              <li>
                <a
                  href="/g/95599dbc3a863bd0febe19c323b8c24f"
                  className="text-blue-600 hover:underline"
                >
                  /g/95599dbc3a863bd0febe19c323b8c24f
                </a>
              </li>
            </ul>
          </div>
        }
      />
    </Routes>
  )
}

export default App
