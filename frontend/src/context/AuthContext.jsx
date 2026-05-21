import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { setAuthToken } from '../services/api'

const AUTH_TOKEN_KEY = 'token'
const AuthContext = createContext(null)

function parseJwtPayload(token) {
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(normalized)
    return JSON.parse(json)
  } catch (err) {
    return null
  }
}

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

  const value = useMemo(() => {
    const user = parseJwtPayload(token)
    return {
      token,
      user,
      role: user?.role || null,
      isAuthenticated: Boolean(token),
      signIn: (nextToken) => setToken(nextToken),
      signOut: () => setToken(null)
    }
  }, [token])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}