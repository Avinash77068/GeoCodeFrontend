import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Search as SearchIcon, SlidersHorizontal, MapPin, CheckSquare, Square } from 'lucide-react'
import { searchBusinesses } from '../api/search'
import { bulkSendMessages } from '../api/messages'
import { useToastContext } from '../context/ToastContext'
import Button from '../components/ui/Button'
import Input, { Select } from '../components/ui/Input'
import BusinessCard from '../components/BusinessCard'
import MessageModal from '../components/MessageModal'
import Spinner from '../components/ui/Spinner'

const CATEGORIES = [
  '', 'restaurant', 'cafe', 'bar', 'hotel', 'gym', 'salon',
  'dentist', 'doctor', 'pharmacy', 'bank', 'store', 'school',
  'church', 'park', 'museum', 'hospital', 'laundry', 'spa',
]

export default function Search() {
  const toast = useToastContext()
  const [form, setForm] = useState({ location: '', radius: '5', category: '', keyword: '' })
  const [results, setResults] = useState(null)
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [messageOpen, setMessageOpen] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [bulkGoal, setBulkGoal] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)

  const searchMutation = useMutation({
    mutationFn: () => searchBusinesses(Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== '')
    )),
    onSuccess: (res) => {
      setResults(res.data)
      setSelected(new Set())
    },
    onError: (err) => {
      toast(err.response?.data?.message || 'Search failed', 'error')
    },
  })

  const handleSearch = (e) => {
    e.preventDefault()
    if (!form.location) { toast('Location is required', 'warning'); return }
    searchMutation.mutate()
  }

  const openMessage = (business) => {
    setSelectedBusiness(business)
    setMessageOpen(true)
  }

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (!results) return
    if (selected.size === results.businesses.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(results.businesses.map((b) => b.id)))
    }
  }

  const handleBulkSend = async () => {
    if (selected.size === 0) { toast('Select at least one business', 'warning'); return }
    setBulkLoading(true)
    try {
      const res = await bulkSendMessages({
        businessIds: [...selected],
        channel: 'email',
        userGoal: bulkGoal,
      })
      const { sent, failed } = res.data.summary
      toast(`Bulk send complete: ${sent} sent, ${failed} failed`, sent > 0 ? 'success' : 'error')
    } catch (err) {
      toast(err.response?.data?.message || 'Bulk send failed', 'error')
    } finally {
      setBulkLoading(false)
    }
  }

  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Search Businesses</h1>
        <p className="text-sm text-gray-500 mt-0.5">Find local businesses to reach out to</p>
      </div>

      <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 space-y-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            label="Location"
            placeholder="e.g. New York, NY"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <Input
            label="Radius (km)"
            type="number"
            min="0.1"
            max="50"
            step="0.5"
            value={form.radius}
            onChange={(e) => setForm({ ...form, radius: e.target.value })}
          />
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">All categories</option>
            {CATEGORIES.filter(Boolean).map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </Select>
          <Input
            label="Keyword (optional)"
            placeholder="e.g. pizza, coffee"
            value={form.keyword}
            onChange={(e) => setForm({ ...form, keyword: e.target.value })}
          />
        </div>
        <Button type="submit" loading={searchMutation.isPending} size="lg">
          <SearchIcon size={16} />
          Search
        </Button>
      </form>

      {results && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-brand-600" />
              <span className="text-sm text-gray-600">
                <strong>{results.count}</strong> results near{' '}
                <span className="font-medium">{results.location?.address}</span>
              </span>
            </div>

            {results.businesses.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={toggleAll}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
                >
                  {selected.size === results.businesses.length
                    ? <CheckSquare size={16} className="text-brand-600" />
                    : <Square size={16} />}
                  {selected.size === results.businesses.length ? 'Deselect all' : 'Select all'}
                </button>

                {selected.size > 0 && (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Bulk goal (optional)"
                      value={bulkGoal}
                      onChange={(e) => setBulkGoal(e.target.value)}
                      className="w-48"
                    />
                    <Button
                      size="sm"
                      onClick={handleBulkSend}
                      loading={bulkLoading}
                    >
                      Send to {selected.size}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {results.businesses.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <SearchIcon size={40} className="mx-auto mb-3 opacity-30" />
              <p>No businesses found. Try a different location or category.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {results.businesses.map((b) => (
                <div key={b.id} className="relative">
                  {selected.size > 0 && (
                    <button
                      className="absolute top-2 left-2 z-10"
                      onClick={() => toggleSelect(b.id)}
                    >
                      {selected.has(b.id)
                        ? <CheckSquare size={18} className="text-brand-600" />
                        : <Square size={18} className="text-gray-400" />}
                    </button>
                  )}
                  <BusinessCard
                    business={b}
                    onMessage={openMessage}
                    selected={selected.has(b.id)}
                    onSelect={(biz) => selected.size > 0 && toggleSelect(biz.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <MessageModal
        open={messageOpen}
        onClose={() => { setMessageOpen(false); setSelectedBusiness(null) }}
        business={selectedBusiness}
      />
    </div>
  )
}
