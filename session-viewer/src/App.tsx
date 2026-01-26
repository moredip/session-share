import { Routes, Route, Navigate } from 'react-router-dom'
import { TranscriptViewer } from './components/TranscriptViewer'
import { NavBar } from './components/NavBar'

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/g/:gistId" element={<TranscriptViewer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
