import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users, Search, MessageSquare, Trash2, Edit3, Eye,
  Building2, Mail, ChevronDown, ChevronUp, X, Check
} from 'lucide-react'
import {
  getAdminDashboard,
  getAllMessages,
  updateAdminMessage,
  deleteAdminMessage,
  getUserSearches,
  getUserMessages,
  deleteUser,
  deleteSearch,
} from '../api/admin'
import { useToastContext } from '../context/ToastContext'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { PageLoader } from '../components/ui/Spinner'

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </CardBody>
    </Card>
  )
}

function UserRow({ user, onViewSearches, onViewMessages, onDelete }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{user.company || '—'}</td>
      <td className="px-4 py-3 text-sm text-center">{user.searches}</td>
      <td className="px-4 py-3 text-sm text-center">{user.messages}</td>
      <td className="px-4 py-3 text-sm text-center">{user.sent}</td>
      <td className="px-4 py-3 text-sm text-gray-400">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewSearches(user)}
            className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
            title="View Searches"
          >
            <Search size={14} />
          </button>
          <button
            onClick={() => onViewMessages(user)}
            className="p-1.5 rounded hover:bg-purple-50 text-purple-600"
            title="View Messages"
          >
            <MessageSquare size={14} />
          </button>
          <button
            onClick={() => onDelete(user)}
            className="p-1.5 rounded hover:bg-red-50 text-red-600"
            title="Delete User"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

function MessageRow({ msg, onEdit, onDelete }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-900">{msg.user?.name || '—'}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{msg.business?.name || '—'}</td>
      <td className="px-4 py-3">
        <Badge color={msg.channel === 'email' ? 'blue' : msg.channel === 'sms' ? 'green' : 'purple'}>
          {msg.channel}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">
        {msg.recipient?.email || msg.recipient?.phone || '—'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 max-w-[250px] truncate">
        {msg.subject || msg.content?.substring(0, 50)}
      </td>
      <td className="px-4 py-3">
        <Badge color={msg.status === 'sent' ? 'green' : msg.status === 'draft' ? 'gray' : 'red'}>
          {msg.status}
        </Badge>
      </td>
      <td className="px-4 py-3 text-xs text-gray-400">
        {new Date(msg.createdAt).toLocaleString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(msg)}
            className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
            title="Edit"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => onDelete(msg)}
            className="p-1.5 rounded hover:bg-red-50 text-red-600"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

function EditMessageModal({ message, onClose, onSave }) {
  const [form, setForm] = useState({
    subject: message.subject || '',
    content: message.content || '',
    status: message.status || 'draft',
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Edit Message</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-32 resize-none"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={() => onSave(message._id, form)}>
            <Check size={14} /> Save
          </Button>
        </div>
      </div>
    </div>
  )
}

function UserDetailModal({ user, type, onClose }) {
  const toast = useToastContext()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', type, user._id],
    queryFn: () => type === 'searches' ? getUserSearches(user._id) : getUserMessages(user._id),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteSearch(id),
    onSuccess: () => {
      toast('Deleted successfully', 'success')
      queryClient.invalidateQueries(['admin', type, user._id])
    },
  })

  const items = data?.data?.[type] || []

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">
            {user.name}'s {type === 'searches' ? 'Searches' : 'Messages'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <p className="text-center text-gray-400 py-8">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No {type} found.</p>
          ) : type === 'searches' ? (
            <div className="space-y-2">
              {items.map((s) => (
                <div key={s._id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.location?.address}</p>
                    <p className="text-xs text-gray-400">
                      {s.radius}km · {s.resultsCount} results · {new Date(s.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(s._id)}
                    className="p-1.5 rounded hover:bg-red-50 text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((m) => (
                <div key={m._id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge color={m.channel === 'email' ? 'blue' : 'green'}>{m.channel}</Badge>
                      <span className="text-sm font-medium text-gray-800">{m.business?.name || 'Unknown'}</span>
                    </div>
                    <Badge color={m.status === 'sent' ? 'green' : 'gray'}>{m.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    To: {m.recipient?.email || m.recipient?.phone || '—'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{m.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(m.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Admin() {
  const toast = useToastContext()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('overview')
  const [editMsg, setEditMsg] = useState(null)
  const [userDetail, setUserDetail] = useState(null)
  const [detailType, setDetailType] = useState('searches')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: getAdminDashboard,
  })

  const { data: messagesData, isLoading: msgsLoading } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => getAllMessages({ limit: 100 }),
    enabled: tab === 'messages',
  })

  const deleteMessageMutation = useMutation({
    mutationFn: deleteAdminMessage,
    onSuccess: () => {
      toast('Message deleted', 'success')
      queryClient.invalidateQueries(['admin-messages'])
      queryClient.invalidateQueries(['admin-dashboard'])
    },
  })

  const updateMessageMutation = useMutation({
    mutationFn: ({ id, data }) => updateAdminMessage(id, data),
    onSuccess: () => {
      toast('Message updated', 'success')
      setEditMsg(null)
      queryClient.invalidateQueries(['admin-messages'])
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast('User deleted', 'success')
      queryClient.invalidateQueries(['admin-dashboard'])
    },
  })

  if (isLoading) return <PageLoader />

  const overview = data?.data?.overview
  const users = data?.data?.users || []
  const messages = messagesData?.data?.messages || []

  const handleDeleteMessage = (msg) => {
    if (window.confirm(`Delete message to ${msg.business?.name}?`)) {
      deleteMessageMutation.mutate(msg._id)
    }
  }

  const handleDeleteUser = (user) => {
    if (window.confirm(`Delete user "${user.name}" and all their data?`)) {
      deleteUserMutation.mutate(user._id)
    }
  }

  const handleEditSave = (id, formData) => {
    updateMessageMutation.mutate({ id, data: formData })
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Users },
    { key: 'messages', label: 'All Messages', icon: MessageSquare },
  ]

  return (
    <div className="space-y-5 max-w-7xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage users, searches, and messages</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Total Users" value={overview?.totalUsers} color="blue" />
        <StatCard icon={Search} label="Total Searches" value={overview?.totalSearches} color="green" />
        <StatCard icon={MessageSquare} label="Messages" value={overview?.totalMessages} color="purple" />
        <StatCard icon={Mail} label="Sent" value={overview?.sentMessages} color="orange" />
        <StatCard icon={Building2} label="Businesses" value={overview?.totalBusinesses} color="red" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-800 text-sm">All Users</h2>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Name</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Email</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Company</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600">Searches</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600">Messages</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600">Sent</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Joined</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <UserRow
                      key={u._id}
                      user={u}
                      onViewSearches={(user) => { setUserDetail(user); setDetailType('searches') }}
                      onViewMessages={(user) => { setUserDetail(user); setDetailType('messages') }}
                      onDelete={handleDeleteUser}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'messages' && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-800 text-sm">All Messages ({messages.length})</h2>
          </CardHeader>
          <div className="overflow-x-auto">
            {msgsLoading ? (
              <div className="p-8 text-center text-gray-400">Loading messages...</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">User</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Business</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Channel</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Recipient</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Content</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Date</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
                        No messages found.
                      </td>
                    </tr>
                  ) : (
                    messages.map((m) => (
                      <MessageRow
                        key={m._id}
                        msg={m}
                        onEdit={setEditMsg}
                        onDelete={handleDeleteMessage}
                      />
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}

      {/* Edit Message Modal */}
      {editMsg && (
        <EditMessageModal
          message={editMsg}
          onClose={() => setEditMsg(null)}
          onSave={handleEditSave}
        />
      )}

      {/* User Detail Modal */}
      {userDetail && (
        <UserDetailModal
          user={userDetail}
          type={detailType}
          onClose={() => setUserDetail(null)}
        />
      )}
    </div>
  )
}
