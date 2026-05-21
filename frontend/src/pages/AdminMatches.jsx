import React, { useEffect, useState } from 'react'
import { approveAdminMatch, fetchAdminMatches, rejectAdminMatch, rematchAdminCandidates } from '../services/api'

function statusClass(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'pending') return 'badge badge--pending'
  if (value === 'contacted') return 'badge badge--contacted'
  if (value === 'rejected') return 'badge badge--rejected'
  return 'badge'
}

export default function AdminMatches() {
  const [status, setStatus] = useState('pending')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingId, setProcessingId] = useState(null)
  const [runningRematch, setRunningRematch] = useState(false)
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 })
  const [notice, setNotice] = useState('')

  async function loadMatches(nextPage = page, nextStatus = status) {
    try {
      setLoading(true)
      const res = await fetchAdminMatches({ page: nextPage, limit: 8, status: nextStatus })
      setItems(res.data || [])
      setMeta(res.pagination || { page: 1, totalPages: 1, total: 0 })
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMatches(page, status)
  }, [page, status])

  async function onApprove(id) {
    try {
      setProcessingId(id)
      await approveAdminMatch(id)
      await loadMatches(page, status)
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessingId(null)
    }
  }

  async function onReject(id) {
    try {
      setProcessingId(id)
      await rejectAdminMatch(id)
      await loadMatches(page, status)
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessingId(null)
    }
  }

  async function onRunRematch() {
    try {
      setRunningRematch(true)
      setNotice('')
      setError('')
      const result = await rematchAdminCandidates()
      setNotice(
        `Re-match complete. Scanned ${result.scannedLost || 0} lost and ${result.scannedFound || 0} found items; generated ${result.created || 0} candidates.`
      )
      await loadMatches(1, 'pending')
      setPage(1)
      setStatus('pending')
    } catch (err) {
      setError(err.message)
    } finally {
      setRunningRematch(false)
    }
  }

  return (
    <section className="py-7 space-y-4">
      <div className="section-heading section-heading--split">
        <div>
          <span className="eyebrow">Admin review</span>
          <h1 className="section-heading__title">Match candidates</h1>
          <p className="section-heading__copy">Review potential lost/found matches, then approve or reject with one click.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="button button--primary" onClick={onRunRematch} disabled={runningRematch}>
            {runningRematch ? 'Re-matching...' : 'Run Re-Match'}
          </button>
          <label className="field-label" htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            value={status}
            onChange={(e) => {
              setPage(1)
              setStatus(e.target.value)
            }}
            className="notion-select"
          >
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {error ? <p className="form-alert form-alert--error">{error}</p> : null}
      {notice ? <p className="text-sm text-green-700">{notice}</p> : null}

      <div className="space-y-3">
        {loading ? <p className="muted">Loading matches...</p> : null}
        {!loading && !items.length ? <p className="muted">No matches for this filter.</p> : null}

        {items.map((match) => (
          <article key={match.id} className="surface-card p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={statusClass(match.status)}>{match.status}</span>
                <span className="badge badge--score">Score: {match.score}</span>
              </div>
              <div className="text-sm muted">Candidate #{match.id}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="detail-card">
                <p className="detail-card__label">Lost item</p>
                <p><strong>{match.lost_title}</strong></p>
                <p className="text-sm muted">{match.lost_description || '-'}</p>
                <p className="text-sm">Location: {match.location_lost || '-'}</p>
                <p className="text-sm">Date: {match.date_lost ? String(match.date_lost).slice(0, 10) : '-'}</p>
                <p className="text-sm">Color: {match.lost_color || '-'}</p>
                <p className="text-sm">Owner: {match.lost_user_name || '-'}</p>
              </div>

              <div className="detail-card">
                <p className="detail-card__label">Found item</p>
                <p><strong>{match.found_title}</strong></p>
                <p className="text-sm muted">{match.found_description || '-'}</p>
                <p className="text-sm">Location: {match.location_found || '-'}</p>
                <p className="text-sm">Date: {match.date_found ? String(match.date_found).slice(0, 10) : '-'}</p>
                <p className="text-sm">Color: {match.found_color || '-'}</p>
                <p className="text-sm">Reporter: {match.found_user_name || '-'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                disabled={processingId === match.id || match.status !== 'pending'}
                className="button button--primary"
                onClick={() => onApprove(match.id)}
              >
                {processingId === match.id ? 'Processing...' : 'Approve + Notify'}
              </button>
              <button
                disabled={processingId === match.id || match.status !== 'pending'}
                className="button"
                onClick={() => onReject(match.id)}
              >
                Reject
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 text-sm">
        <p className="muted">Total: {meta.total || 0}</p>
        <div className="flex items-center gap-2">
          <button
            className="notion-button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </button>
          <span className="muted">Page {meta.page || page} / {meta.totalPages || 1}</span>
          <button
            className="notion-button"
            onClick={() => setPage((p) => Math.min(meta.totalPages || 1, p + 1))}
            disabled={page >= (meta.totalPages || 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}