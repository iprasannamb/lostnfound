import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { setAuthToken } from '../services/api'

const AUTH_TOKEN_KEY = 'token'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(AUTH_TOKEN_KEY)
  })

  useEffect(() => {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token)
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY)
    }

    setAuthToken(token)
  }, [token])

  const value = useMemo(() => ({
    token,
    isAuthenticated: Boolean(token),
    signIn: (nextToken) => setToken(nextToken),
    signOut: () => setToken(null)
  }), [token])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}