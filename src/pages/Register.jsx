import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToastContext } from '../context/ToastContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Register() {
  const { register } = useAuth()
  const toast = useToastContext()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', company: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email) e.email = 'Email is required'
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    return e
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      toast(err.response?.data?.message || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-brand-600 rounded-2xl mb-3">
            <MapPin size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-sm text-gray-500 mt-1">Start reaching out to local businesses</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={form.name}
            onChange={set('name')}
            error={errors.name}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min 6 characters"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
          />
          <Input
            label="Phone (optional)"
            type="tel"
            placeholder="+1 555 000 0000"
            value={form.phone}
            onChange={set('phone')}
          />
          <Input
            label="Company (optional)"
            placeholder="Your company name"
            value={form.company}
            onChange={set('company')}
          />
          <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
