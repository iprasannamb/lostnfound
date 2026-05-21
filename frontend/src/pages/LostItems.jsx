import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createLostItem, fetchLostItems } from '../services/api'

export default function LostItems(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 })
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    date_lost: '',
    location_lost: '',
    contact_info: '',
    image: null
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        const res = await fetchLostItems({ page, limit: 10, q })
        if (!cancelled) {
          setItems(res.data || [])
          setMeta(res.pagination || { page: 1, totalPages: 1, total: 0 })
          setError('')
        }
      } catch (err) {
        if (!cancelled) setError('Could not load lost items')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [page, q])

  const onChange = (e) => {
    const { name, value, files } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      setSubmitError('')
      setSubmitSuccess('')

      const categoryId = form.category_id.trim()
      if (categoryId && Number.isNaN(Number.parseInt(categoryId, 10))) {
        throw new Error('Category ID must be a valid number')
      }

      const token = localStorage.getItem('token')
      if (!token) throw new Error('Please login first to report a lost item.')

      const payload = new FormData()
      payload.append('title', form.title)
      payload.append('description', form.description)
      if (categoryId) payload.append('category_id', categoryId)
      payload.append('date_lost', form.date_lost)
      payload.append('location_lost', form.location_lost)
      payload.append('contact_info', form.contact_info)
      if (form.image) payload.append('image', form.image)

      await createLostItem(payload)

      setSubmitSuccess('Lost item reported successfully.')
      setForm({
        title: '',
        description: '',
        category_id: '',
        date_lost: '',
        location_lost: '',
        contact_info: '',
        image: null
      })
      setPage(1)
      const res = await fetchLostItems({ page: 1, limit: 10, q })
      setItems(res.data || [])
      setMeta(res.pagination || { page: 1, totalPages: 1, total: 0 })
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-7 space-y-4">
      <div className="section-heading">
        <span className="eyebrow">Public listing</span>
        <h1 className="section-heading__title">Lost items</h1>
        <p className="section-heading__copy">Search and track all reported lost items through the same MySQL-backed API.</p>
      </div>

      <div className="surface-card p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <input
            value={q}
            onChange={(e) => {
              setPage(1)
              setQ(e.target.value)
            }}
            placeholder="Search by title, description, or location"
            className="notion-input w-full md:max-w-md"
          />
          <button className="button button--primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Close form' : 'Report Lost Item'}
          </button>
        </div>
      </div>

      {showForm ? (
        <form onSubmit={onSubmit} className="surface-card p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input name="title" value={form.title} onChange={onChange} required className="notion-input" placeholder="Title" />
          <input name="category_id" value={form.category_id} onChange={onChange} className="notion-input" placeholder="Category ID (e.g., 1)" />
          <input name="date_lost" value={form.date_lost} onChange={onChange} type="date" className="notion-input" />
          <input name="location_lost" value={form.location_lost} onChange={onChange} className="notion-input" placeholder="Location lost" />
          <input name="contact_info" value={form.contact_info} onChange={onChange} className="notion-input" placeholder="Contact info" />
          <input name="image" onChange={onChange} type="file" accept="image/*" className="notion-input py-2" />
          <textarea name="description" value={form.description} onChange={onChange} className="notion-input md:col-span-2 min-h-[96px] py-2" placeholder="Description" />

          {submitError ? <p className="md:col-span-2 text-sm text-red-600">{submitError}</p> : null}
          {submitSuccess ? <p className="md:col-span-2 text-sm text-green-700">{submitSuccess}</p> : null}

          <div className="md:col-span-2">
            <button disabled={submitting} className="notion-button notion-button-primary">
              {submitting ? 'Submitting...' : 'Submit report'}
            </button>
          </div>
        </form>
      ) : null}

      <div className="surface-card overflow-hidden">
        {loading ? (
          <p className="p-4 muted">Loading...</p>
        ) : error ? (
          <p className="p-4 text-red-600 text-sm">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="notion-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Posted by</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                    <tr key={item.id} className="table-row-hover">
                    <td>
                      <Link to={`/items/lost/${item.id}`} className="text-blue-700 hover:underline">
                        {item.title}
                      </Link>
                    </td>
                    <td>{item.category_name || '-'}</td>
                    <td>{item.location_lost || '-'}</td>
                    <td className="capitalize">{item.status}</td>
                    <td>{item.user_name}</td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td colSpan="5" className="muted">No lost items found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
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
