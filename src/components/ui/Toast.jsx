import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const config = {
  success: { icon: CheckCircle, bg: 'bg-green-50 border-green-200', text: 'text-green-800', iconColor: 'text-green-500' },
  error: { icon: XCircle, bg: 'bg-red-50 border-red-200', text: 'text-red-800', iconColor: 'text-red-500' },
  warning: { icon: AlertCircle, bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800', iconColor: 'text-yellow-500' },
  info: { icon: Info, bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', iconColor: 'text-blue-500' },
}

export default function Toast({ message, type = 'info', onClose }) {
  const { icon: Icon, bg, text, iconColor } = config[type] || config.info

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-72 max-w-sm ${bg}`}>
      <Icon size={18} className={`mt-0.5 shrink-0 ${iconColor || text}`} />
      <p className={`text-sm flex-1 ${text}`}>{message}</p>
      <button onClick={onClose} className={`shrink-0 ${text} hover:opacity-70`}>
        <X size={16} />
      </button>
    </div>
  )
}
