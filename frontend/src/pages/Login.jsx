import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginUser, setAuthToken } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const destination = location.state?.from?.pathname || '/dashboard'

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    const nextErrors = {}
    if (!form.email.trim()) nextErrors.email = 'Email is required'
    if (!form.password.trim()) nextErrors.password = 'Password is required'
    if (form.password && form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters'
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors)
      return
    }

    try {
      setLoading(true)
      setError('')
      setFieldErrors({})
      const data = await loginUser(form)
      localStorage.setItem('token', data.token)
      setAuthToken(data.token)
      signIn(data.token)
      navigate(destination, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-layout py-8">
      <div className="auth-panel">
        <span className="eyebrow">Secure access</span>
        <h1 className="auth-title">Sign in to your campus account</h1>
        <p className="auth-copy">
          The backend expects a valid email and password. Once authenticated, the token is saved and attached to protected item submissions.
        </p>
        <div className="auth-notes">
          <div className="auth-note">JWT stored locally</div>
          <div className="auth-note">Redirects back to protected pages</div>
          <div className="auth-note">Works with the current Express API</div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="surface-card auth-form p-6 space-y-4">
        <div>
          <label className="field-label" htmlFor="login-email">Email</label>
          <input id="login-email" name="email" value={form.email} onChange={onChange} className="notion-input w-full" placeholder="student@college.edu" type="email" autoComplete="email" />
          {fieldErrors.email ? <p className="field-error">{fieldErrors.email}</p> : null}
        </div>
        <div>
          <label className="field-label" htmlFor="login-password">Password</label>
          <input id="login-password" name="password" value={form.password} onChange={onChange} className="notion-input w-full" placeholder="Enter your password" type="password" autoComplete="current-password" />
          {fieldErrors.password ? <p className="field-error">{fieldErrors.password}</p> : null}
        </div>
        {error ? <p className="form-alert form-alert--error" role="alert">{error}</p> : null}
        <button disabled={loading} className="button button--primary w-full">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="auth-footnote">
          New user? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </section>
  )
}
