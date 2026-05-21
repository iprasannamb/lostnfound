import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginUser, registerUser, setAuthToken } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Register(){
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
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
    if (!form.name.trim()) nextErrors.name = 'Full name is required'
    if (!form.email.trim()) nextErrors.email = 'Email is required'
    if (!form.password.trim()) nextErrors.password = 'Password is required'
    if (form.password && form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters'
    if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match'
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors)
      return
    }

    try {
      setLoading(true)
      setError('')
      setFieldErrors({})

      await registerUser({
        name: form.name,
        email: form.email,
        password: form.password
      })

      const loginData = await loginUser({ email: form.email, password: form.password })
      localStorage.setItem('token', loginData.token)
      setAuthToken(loginData.token)
      signIn(loginData.token)
      navigate(destination, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-layout py-8">
      <div className="auth-panel auth-panel--accent">
        <span className="eyebrow">Create account</span>
        <h1 className="auth-title">Register once, report and claim later</h1>
        <p className="auth-copy">
          The register flow creates the user in MySQL and then signs them in against the same backend so the token is ready immediately.
        </p>
        <div className="auth-notes">
          <div className="auth-note">Name, email, and password validated client-side</div>
          <div className="auth-note">Backend duplicate email checks still apply</div>
          <div className="auth-note">Auto sign-in after account creation</div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="surface-card auth-form p-6 space-y-4">
        <div>
          <label className="field-label" htmlFor="register-name">Full name</label>
          <input id="register-name" name="name" value={form.name} onChange={onChange} className="notion-input w-full" placeholder="Your full name" autoComplete="name" />
          {fieldErrors.name ? <p className="field-error">{fieldErrors.name}</p> : null}
        </div>
        <div>
          <label className="field-label" htmlFor="register-email">Email</label>
          <input id="register-email" name="email" value={form.email} onChange={onChange} className="notion-input w-full" placeholder="student@college.edu" type="email" autoComplete="email" />
          {fieldErrors.email ? <p className="field-error">{fieldErrors.email}</p> : null}
        </div>
        <div>
          <label className="field-label" htmlFor="register-password">Password</label>
          <input id="register-password" name="password" value={form.password} onChange={onChange} className="notion-input w-full" placeholder="At least 6 characters" type="password" autoComplete="new-password" />
          {fieldErrors.password ? <p className="field-error">{fieldErrors.password}</p> : null}
        </div>
        <div>
          <label className="field-label" htmlFor="register-confirm-password">Confirm password</label>
          <input id="register-confirm-password" name="confirmPassword" value={form.confirmPassword} onChange={onChange} className="notion-input w-full" placeholder="Repeat your password" type="password" autoComplete="new-password" />
          {fieldErrors.confirmPassword ? <p className="field-error">{fieldErrors.confirmPassword}</p> : null}
        </div>
        {error ? <p className="form-alert form-alert--error" role="alert">{error}</p> : null}
        <button disabled={loading} className="button button--primary w-full">
          {loading ? 'Creating account...' : 'Create account'}
        </button>
        <p className="auth-footnote">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </section>
  )
}
