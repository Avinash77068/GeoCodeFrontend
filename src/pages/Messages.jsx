import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, ChevronLeft, ChevronRight, Eye, Pencil } from 'lucide-react'
import { getMessages, getMessageById, updateMessage } from '../api/messages'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { Select } from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { PageLoader } from '../components/ui/Spinner'
import { useToastContext } from '../context/ToastContext'

const statusColor = {
  sent: 'green', draft: 'gray', failed: 'red', delivered: 'blue', opened: 'purple',
}
const channelColor = { email: 'blue', sms: 'green', whatsapp: 'purple' }

function MessageDetailModal({ id, open, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ['message', id],
    queryFn: () => getMessageById(id),
    enabled: !!id && open,
  })
  const msg = data?.data?.message

  return (
    <Modal open={open} onClose={onClose} title="Message Detail" size="lg">
      {isLoading ? (
        <div className="flex justify-center py-8"><PageLoader /></div>
      ) : msg ? (
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge color={channelColor[msg.channel]}>{msg.channel}</Badge>
            <Badge color={statusColor[msg.status]}>{msg.status}</Badge>
            {msg.aiGenerated && <Badge color="purple">AI Generated</Badge>}
          </div>
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <p><span className="text-gray-500">Business:</span> <strong>{msg.business?.name}</strong></p>
            {msg.recipient?.email && <p><span className="text-gray-500">To:</span> {msg.recipient.email}</p>}
            {msg.subject && <p><span className="text-gray-500">Subject:</span> {msg.subject}</p>}
            <p><span className="text-gray-500">Sent:</span> {msg.metadata?.sentAt ? new Date(msg.metadata.sentAt).toLocaleString() : 'Not sent'}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-2">Message:</p>
            <div className="bg-white border border-gray-200 rounded-lg p-4 whitespace-pre-wrap text-gray-800">
              {msg.content}
            </div>
          </div>
          {msg.metadata?.errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
              Error: {msg.metadata.errorMessage}
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  )
}

function EditMessageModal({ msg, open, onClose }) {
  const toast = useToastContext()
  const queryClient = useQueryClient()
  const [subject, setSubject] = useState(msg?.subject || '')
  const [content, setContent] = useState(msg?.content || '')

  const editMutation = useMutation({
    mutationFn: () => updateMessage(msg._id, { subject, content }),
    onSuccess: () => {
      toast('Message updated successfully!', 'success')
      queryClient.invalidateQueries(['messages'])
      onClose()
    },
    onError: (err) => {
      toast(err.response?.data?.message || 'Update failed', 'error')
    },
  })

  return (
    <Modal open={open} onClose={onClose} title="Edit Message" size="lg">
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
          <p className="font-medium text-gray-800">{msg?.business?.name}</p>
        </div>
        {msg?.channel === 'email' && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Subject</label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm text-gray-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Message Content</label>
          <textarea
            className="w-full rounded-lg border px-3 py-2 text-sm text-gray-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={() => editMutation.mutate()}
            loading={editMutation.isPending}
            disabled={!content}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default function Messages() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [channel, setChannel] = useState('')
  const [detailId, setDetailId] = useState(null)
  const [editMsg, setEditMsg] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['messages', page, status, channel],
    queryFn: () => getMessages({ page, limit: 20, status: status || undefined, channel: channel || undefined }),
  })

  const messages = data?.data?.messages || []
  const totalPages = data?.data?.totalPages || 1

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.data?.total ?? 0} total messages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="w-32">
            <option value="">All status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="delivered">Delivered</option>
            <option value="opened">Opened</option>
          </Select>
          <Select value={channel} onChange={(e) => { setChannel(e.target.value); setPage(1) }} className="w-32">
            <option value="">All channels</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : messages.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p>No messages yet.</p>
        </div>
      ) : (
        <Card>
          <div className="divide-y divide-gray-50">
            {messages.map((msg) => (
              <div key={msg._id} className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex w-[100%]">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-sm text-gray-900 truncate">
                      {msg.business?.name || 'Unknown business'}
                    </span>
                    <Badge color={channelColor[msg.channel]}>{msg.channel}</Badge>
                    <Badge color={statusColor[msg.status]}>{msg.status}</Badge>
                    {msg.aiGenerated && <Badge color="purple">AI</Badge>}
                  </div>
                  {msg.subject && (
                    <p className="text-xs text-gray-500 mb-1 truncate">{msg.subject}</p>
                  )}
                  <p className="text-xs text-gray-400 line-clamp-2">{msg.content}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-xs text-gray-400">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDetailId(msg._id)}
                      className="text-brand-500 hover:text-brand-700"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => setEditMsg(msg)}
                      className="text-gray-400 hover:text-brand-600"
                    >
                      <Pencil size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft size={15} />
          </Button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            <ChevronRight size={15} />
          </Button>
        </div>
      )}

      <MessageDetailModal
        id={detailId}
        open={!!detailId}
        onClose={() => setDetailId(null)}
      />

      {editMsg && (
        <EditMessageModal
          msg={editMsg}
          open={!!editMsg}
          onClose={() => setEditMsg(null)}
        />
      )}
    </div>
  )
}