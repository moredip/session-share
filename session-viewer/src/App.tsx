import { Routes, Route } from 'react-router-dom'
import { TranscriptViewer } from './components/TranscriptViewer'
import { HomePage } from './components/HomePage'
import { NavBar } from './components/NavBar'

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/g/:gistId" element={<TranscriptViewer />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </>
  )
}

export default App
