import { useState } from 'react'
import Header from './components/Header'
import Home from './components/Home'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      <Header />
      <Home />
      <Footer />
    </div>
  )
}

