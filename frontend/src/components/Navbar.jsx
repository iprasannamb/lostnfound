import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar(){
  const navigate = useNavigate()
  const { isAuthenticated, role, signOut } = useAuth()

  const navClass = ({ isActive }) =>
    `nav-link ${isActive ? 'nav-link--active' : ''}`;

  const handleLogout = () => {
    signOut()
    navigate('/')
  }

  return (
    <nav className="site-nav sticky top-0 z-20">
      <div className="container site-nav__inner">
        <Link to="/" className="brand-mark">
          <span className="brand-mark__dot" />
          Lost & Found
        </Link>
        <div className="site-nav__links">
          <NavLink to="/lost" className={navClass}>Lost</NavLink>
          <NavLink to="/found" className={navClass}>Found</NavLink>
          <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
          {isAuthenticated && role === 'admin' ? (
            <NavLink to="/admin/matches" className={navClass}>Admin Matches</NavLink>
          ) : null}
          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className={navClass}>Sign in</NavLink>
              <NavLink to="/register" className={navClass}>Sign up</NavLink>
            </>
          ) : (
            <button onClick={handleLogout} className="nav-link nav-link--ghost">
              Sign out
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
