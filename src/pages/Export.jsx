import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, FileText, Code2, Search, BarChart2 } from 'lucide-react'
import { getStats, exportLeads } from '../api/export'
import { getSearchHistory } from '../api/search'
import { useToastContext } from '../context/ToastContext'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Select } from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import { PageLoader } from '../components/ui/Spinner'

export default function Export() {
  const toast = useToastContext()
  const [format, setFormat] = useState('csv')
  const [searchId, setSearchId] = useState('')
  const [exporting, setExporting] = useState(false)

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
  })

  const { data: historyData } = useQuery({
    queryKey: ['search-history'],
    queryFn: () => getSearchHistory({ limit: 20 }),
  })

  const stats = statsData?.data?.stats
  const searches = historyData?.data?.searches || []

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportLeads({ format, searchId: searchId || undefined })
      if (format === 'csv') {
        toast('CSV downloaded successfully', 'success')
      } else {
        toast('Leads exported as JSON', 'success')
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Export failed', 'error')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Export</h1>
        <p className="text-sm text-gray-500 mt-0.5">Download leads and view your outreach statistics</p>
      </div>

      {statsLoading ? (
        <PageLoader />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Searches', value: stats?.totalSearches, color: 'blue' },
            { label: 'Businesses', value: stats?.uniqueBusinesses, color: 'green' },
            { label: 'Messages', value: stats?.totalMessages, color: 'purple' },
            { label: 'Sent', value: stats?.sentMessages, color: 'orange' },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardBody className="text-center py-3">
                <p className="text-2xl font-bold text-gray-900">{value ?? 0}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download size={16} className="text-gray-400" />
            <h2 className="font-semibold text-gray-800 text-sm">Export Leads</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-gray-500">
            Export businesses from a specific search or all businesses you've contacted.
          </p>

          <Select
            label="Filter by Search (optional)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          >
            <option value="">All contacted businesses</option>
            {searches.map((s) => (
              <option key={s._id} value={s._id}>
                {s.location?.address} — {s.resultsCount} results ({new Date(s.createdAt).toLocaleDateString()})
              </option>
            ))}
          </Select>

          <div className="flex gap-3">
            <button
              onClick={() => setFormat('csv')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                format === 'csv'
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <FileText size={16} />
              CSV
            </button>
            <button
              onClick={() => setFormat('json')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                format === 'json'
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Code2 size={16} />
              JSON
            </button>
          </div>

          <Button onClick={handleExport} loading={exporting} size="lg" className="w-full">
            <Download size={16} />
            Export {format.toUpperCase()}
          </Button>
        </CardBody>
      </Card>

      {searches.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search size={16} className="text-gray-400" />
              <h2 className="font-semibold text-gray-800 text-sm">Search History</h2>
            </div>
          </CardHeader>
          <div className="divide-y divide-gray-50">
            {searches.map((s) => (
              <div key={s._id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700 font-medium">{s.location?.address}</p>
                  <p className="text-xs text-gray-400">
                    {s.radius}km radius · {s.resultsCount} businesses
                    {s.filters?.category?.length > 0 && ` · ${s.filters.category.join(', ')}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => { setSearchId(s._id); setFormat('csv') }}
                  >
                    Select
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
