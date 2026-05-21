import React from 'react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchItemDetails } from '../services/api'

export default function ItemDetails(){
  const { type, id } = useParams();
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        const data = await fetchItemDetails(type, id)
        if (!cancelled) {
          setItem(data)
          setError('')
        }
      } catch (err) {
        if (!cancelled) setError('Could not fetch item details')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [type, id])

  return (
    <section className="py-7 space-y-4">
      <div className="section-heading">
        <span className="eyebrow">Record view</span>
        <h1 className="section-heading__title">Item details</h1>
      </div>
      {loading ? (
        <p className="muted">Loading...</p>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : item ? (
        <div className="surface-card p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="muted">Type</p>
              <p className="capitalize">{type}</p>
            </div>
            <div>
              <p className="muted">Status</p>
              <p className="capitalize">{item.status}</p>
            </div>
            <div>
              <p className="muted">Title</p>
              <p>{item.title}</p>
            </div>
            <div>
              <p className="muted">Category</p>
              <p>{item.category_name || '-'}</p>
            </div>
            <div>
              <p className="muted">Location</p>
              <p>{type === 'lost' ? item.location_lost : item.location_found}</p>
            </div>
            <div>
              <p className="muted">Contact</p>
              <p>{item.contact_info || item.user_email || '-'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="muted">Description</p>
              <p>{item.description || '-'}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="muted">No details available.</p>
      )}
    </section>
  )
}
