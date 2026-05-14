import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
}

interface CustomerFormProps {
  onSuccess: () => void
  onClose: () => void
  customer?: Customer | null
}

export default function CustomerForm({
  onSuccess,
  onClose,
  customer,
}: CustomerFormProps) {
  const [name, setName] = useState(customer?.name ?? '')
  const [phone, setPhone] = useState(
    customer?.phone ?? ''
  )
  const [email, setEmail] = useState(
    customer?.email ?? ''
  )
  const [address, setAddress] = useState(
    customer?.address ?? ''
  )

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault()
    setLoading(true)
    setError('')

    let dbError: string | null = null

    if (customer) {
      const { error } = await supabase
        .from('customers')
        .update({
          name,
          phone: phone || null,
          email: email || null,
          address: address || null,
        })
        .eq('id', customer.id)

      dbError = error?.message ?? null
    } else {
      const { error } = await supabase
        .from('customers')
        .insert([
          {
            name,
            phone: phone || null,
            email: email || null,
            address: address || null,
          },
        ])

      dbError = error?.message ?? null
    }

    setLoading(false)

    if (dbError) {
      setError(dbError)
      return
    }

    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4"
        >
          <h2 className="text-2xl font-bold">
            {customer
              ? 'Edit Customer'
              : 'Add Customer'}
          </h2>

          {error && (
            <div className="rounded bg-red-100 p-3 text-red-700">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Customer Name"
            className="w-full border rounded-lg p-3"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
          />

          <input
            type="text"
            placeholder="Phone Number"
            className="w-full border rounded-lg p-3"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
          />

          <input
            type="email"
            placeholder="Email Address"
            className="w-full border rounded-lg p-3"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <textarea
            placeholder="Address"
            className="w-full border rounded-lg p-3"
            rows={3}
            value={address}
            onChange={(e) =>
              setAddress(e.target.value)
            }
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? 'Saving...'
                : customer
                  ? 'Update Customer'
                  : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}