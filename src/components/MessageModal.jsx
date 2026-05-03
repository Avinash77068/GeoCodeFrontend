import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Wand2, Send } from 'lucide-react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import Input, { Select, Textarea } from './ui/Input'
import { generateMessage, sendMessage } from '../api/messages'
import { useToastContext } from '../context/ToastContext'

export default function MessageModal({ open, onClose, business }) {
  const toast = useToastContext()
  const [channel, setChannel] = useState('email')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [userGoal, setUserGoal] = useState('')

  useEffect(() => {
    if (open) {
      setChannel('email')
      setSubject('')
      setContent('')
      setUserGoal('')
    }
  }, [open])

  const generateMutation = useMutation({
    mutationFn: () => generateMessage({ businessId: business.id, userGoal }),
    onSuccess: (res) => {
      const { message, suggestedSubject } = res.data
      if (message) {
        setContent(message)
        setSubject(suggestedSubject || '')
        toast('Message generated successfully', 'success')
      } else {
        toast('AI returned an empty message. Try again.', 'warning')
      }
    },
    onError: (err) => {
      toast(err.response?.data?.message || 'Failed to generate message', 'error')
    },
  })

  const sendMutation = useMutation({
    mutationFn: () =>
      sendMessage({
        businessId: business.id,
        channel,
        content,
        subject,
        aiGenerated: generateMutation.isSuccess,
      }),
    onSuccess: () => {
      toast('Message sent successfully!', 'success')
      onClose()
    },
    onError: (err) => {
      toast(err.response?.data?.message || 'Failed to send message', 'error')
    },
  })

  if (!business) return null

  return (
    <Modal open={open} onClose={onClose} title={`Message — ${business.name}`} size="lg">
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
          <p className="font-medium text-gray-800">{business.name}</p>
          <p>{business.address}</p>
          {business.phone && <p>{business.phone}</p>}
        </div>

        <Select
          label="Channel"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        >
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="whatsapp">WhatsApp</option>
        </Select>

        {channel === 'email' && (
          <Input
            label="Subject"
            placeholder="e.g. Partnership Opportunity"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        )}

        <Input
          label="Your Goal (for AI generation)"
          placeholder="e.g. introduce my marketing services"
          value={userGoal}
          onChange={(e) => setUserGoal(e.target.value)}
        />

        <Textarea
          label="Message Content"
          placeholder="Write your message or use AI to generate one..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
        />

        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={() => generateMutation.mutate()}
            loading={generateMutation.isPending}
            disabled={sendMutation.isPending}
          >
            <Wand2 size={15} />
            Generate with AI
          </Button>
          <Button
            className="flex-1"
            onClick={() => sendMutation.mutate()}
            loading={sendMutation.isPending}
            disabled={!content || generateMutation.isPending}
          >
            <Send size={15} />
            Send Message
          </Button>
        </div>
      </div>
    </Modal>
  )
}
