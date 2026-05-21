import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchFoundItems, fetchLostItems } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Dashboard(){
  const { signOut } = useAuth()
  const [summary, setSummary] = useState({ lost: 0, found: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadSummary() {
      try {
        setLoading(true)
        const [lostResponse, foundResponse] = await Promise.all([
          fetchLostItems({ limit: 1 }),
          fetchFoundItems({ limit: 1 })
        ])

        if (!cancelled) {
          setSummary({
            lost: lostResponse?.pagination?.total || 0,
            found: foundResponse?.pagination?.total || 0
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadSummary()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="py-8 space-y-5">
      <div className="section-heading section-heading--split">
        <div>
          <span className="eyebrow">Protected area</span>
          <h1 className="section-heading__title">Dashboard</h1>
          <p className="section-heading__copy">This screen is only accessible after a successful backend login.</p>
        </div>
        <button className="button" onClick={signOut}>Sign out</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="surface-card p-5">
          <p className="detail-card__label">Lost items</p>
          <p className="metric-value">{loading ? '...' : summary.lost}</p>
          <p className="detail-card__copy">All records currently available from the backend.</p>
        </article>
        <article className="surface-card p-5">
          <p className="detail-card__label">Found items</p>
          <p className="metric-value">{loading ? '...' : summary.found}</p>
          <p className="detail-card__copy">Public listings stay in sync with the API.</p>
        </article>
        <article className="surface-card p-5">
          <p className="detail-card__label">Next step</p>
          <p className="metric-value">Report</p>
          <p className="detail-card__copy">Use the item pages to add a new lost or found report.</p>
        </article>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="surface-card p-5">
          <h2 className="section-card__title">Quick actions</h2>
          <div className="hero-actions mt-4">
            <Link to="/lost" className="button button--primary">Add lost item</Link>
            <Link to="/found" className="button">Add found item</Link>
          </div>
        </article>
        <article className="surface-card p-5">
          <h2 className="section-card__title">Auth check</h2>
          <p className="section-card__copy">
            Your protected API calls are ready because the token was saved during login and is reapplied on refresh.
          </p>
        </article>
      </div>
    </section>
  )
}
