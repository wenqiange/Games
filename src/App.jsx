import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ChessPage from './pages/ChessPage'
import AuthPage from './pages/AuthPage'
import Menu from './components/Menu'
import './App.css'

export default function App(){
  return (
    <div className="app">
      <div className="header">
        <h2>WhenGames - Mini Juegos</h2>
        <Menu />
      </div>

      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/chess" element={<ChessPage/>} />
        <Route path="/auth" element={<AuthPage/>} />
      </Routes>
    </div>
  )
}
