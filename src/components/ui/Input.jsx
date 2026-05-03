export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
          disabled:bg-gray-50 disabled:cursor-not-allowed
          ${error ? 'border-red-400' : 'border-gray-300'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <select
        className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
          disabled:bg-gray-50 bg-white
          ${error ? 'border-red-400' : 'border-gray-300'}
          ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <textarea
        className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
          disabled:bg-gray-50 resize-y
          ${error ? 'border-red-400' : 'border-gray-300'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
