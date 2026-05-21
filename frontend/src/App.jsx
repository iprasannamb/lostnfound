import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import LostItems from './pages/LostItems'
import FoundItems from './pages/FoundItems'
import ItemDetails from './pages/ItemDetails'
import Dashboard from './pages/Dashboard'
import AdminMatches from './pages/AdminMatches'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

export default function App(){
  return (
    <AuthProvider>
      <div className="app-shell min-h-screen">
        <div className="app-shell__orb app-shell__orb--one" />
        <div className="app-shell__orb app-shell__orb--two" />
        <Navbar />
        <main className="container app-content">
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
            <Route path="/lost" element={<LostItems/>} />
            <Route path="/found" element={<FoundItems/>} />
            <Route path="/items/:type/:id" element={<ItemDetails/>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
            <Route path="/admin/matches" element={<AdminRoute><AdminMatches/></AdminRoute>} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}
