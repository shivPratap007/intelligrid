import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ElectricityTheft from './component/ElectricityTheft'
import Navbar from './component/Navbar'
import SolarData from './component/SolarData'
import Home from './component/Home'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/electricity-theft" element={<ElectricityTheft />} />
            <Route path="/solar-data" element={<SolarData />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
