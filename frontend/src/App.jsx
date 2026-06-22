import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Homepage from './pages/Homepage'
import CreatePage from './pages/CreatePage'
import Navbar from './components/Navbar'

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/create' element={<CreatePage />} />
      </Routes>
    </div>
  )
}

export default App
