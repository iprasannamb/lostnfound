import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const featureCards = [
  {
    title: 'JWT-backed sessions',
    description: 'Login and registration talk directly to the Express API and persist the token locally.'
  },
  {
    title: 'MySQL data source',
    description: 'Lost, found, and claim data come from the database schema already loaded in this project.'
  },
  {
    title: 'Fast reporting flow',
    description: 'Create item reports from the UI, attach an image, and keep the backend contract intact.'
  }
]

export default function Home(){
  const { isAuthenticated } = useAuth()

  return (
    <section className="py-8 space-y-6">
      <div className="hero-panel">
        <div className="hero-panel__content">
          <span className="eyebrow">Campus recovery desk</span>
          <h1 className="hero-title">Lost and Found Management System</h1>
          <p className="hero-lead">
            A cleaner frontend over the existing Express and MySQL backend. Report items, review listings, and keep the sign-in flow tied to real API calls.
          </p>
          <div className="hero-actions">
            <Link to="/lost" className="button button--primary">Browse Lost Items</Link>
            <Link to="/found" className="button">Browse Found Items</Link>
            {isAuthenticated ? (
              <Link to="/dashboard" className="button button--ghost">Open Dashboard</Link>
            ) : (
              <Link to="/register" className="button button--ghost">Create Account</Link>
            )}
          </div>
        </div>

        <div className="hero-panel__aside">
          <div className="status-card">
            <p className="status-card__label">Session status</p>
            <p className="status-card__value">{isAuthenticated ? 'Signed in' : 'Guest mode'}</p>
            <p className="status-card__copy">
              {isAuthenticated
                ? 'Your token is stored locally and attached to authenticated item submissions.'
                : 'Sign in to submit reports and keep your session available after refresh.'}
            </p>
          </div>
          <div className="mini-grid">
            <div className="mini-stat">
              <span>01</span>
              <p>JWT login</p>
            </div>
            <div className="mini-stat">
              <span>02</span>
              <p>MySQL backend</p>
            </div>
            <div className="mini-stat">
              <span>03</span>
              <p>Claim tracking</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featureCards.map((card) => (
          <article key={card.title} className="surface-card surface-card--soft p-5">
            <h3 className="section-card__title">{card.title}</h3>
            <p className="section-card__copy">{card.description}</p>
          </article>
        ))}
      </div>

      <div className="surface-card p-6">
        <div className="section-heading">
          <h2 className="section-heading__title">Why this version works better</h2>
          <p className="section-heading__copy">The UI now reflects the actual backend shape instead of feeling like a placeholder shell.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div className="detail-card">
            <p className="detail-card__label">Connection</p>
            <p className="detail-card__copy">All authentication and item creation still go through the same API endpoints under <span className="inline-code">/api</span>.</p>
          </div>
          <div className="detail-card">
            <p className="detail-card__label">UX</p>
            <p className="detail-card__copy">The landing page, auth screens, and dashboard now share one visual language with clearer calls to action.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
