import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'

interface SettingsData {
  id?: string
  business_name: string
  tagline: string
  address: string
  phone: string
  email: string
  gstin: string
  invoice_prefix: string
  invoice_footer: string
  currency_symbol: string
}

const defaultSettings: SettingsData = {
  business_name: '',
  tagline: '',
  address: '',
  phone: '',
  email: '',
  gstin: '',
  invoice_prefix: 'INV-',
  invoice_footer: 'Thank you for your business.',
  currency_symbol: '₹',
}

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<SettingsData>(defaultSettings)

  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    setLoading(true)

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (!error && data) {
      setSettings({
        ...defaultSettings,
        ...data,
      })
    }

    setLoading(false)
  }

  function updateField(
    field: keyof SettingsData,
    value: string
  ) {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  async function handleSave() {
    setSaving(true)

    let error

    if (settings.id) {
      const result = await supabase
        .from('settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id)

      error = result.error
    } else {
      const result = await supabase
        .from('settings')
        .insert([
          {
            ...settings,
            updated_at: new Date().toISOString(),
          },
        ])

      error = result.error
    }

    if (error) {
      alert(error.message)
    } else {
      alert('Settings saved successfully.')
      await loadSettings()
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="p-8 text-gray-500">
        Loading settings...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
            <h1 className="text-4xl font-bold text-gray-900">
            Settings
            </h1>
            <p className="text-gray-600 mt-2">
            Configure company and invoice settings.
            </p>
        </div>

        <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
            Back
        </button>
       </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-6">
        <h2 className="text-xl font-semibold">
          Company Information
        </h2>

        <input
          type="text"
          placeholder="Business Name"
          className="w-full border rounded-lg p-3"
          value={settings.business_name}
          onChange={(e) =>
            updateField(
              'business_name',
              e.target.value
            )
          }
        />

        <input
          type="text"
          placeholder="Tagline"
          className="w-full border rounded-lg p-3"
          value={settings.tagline}
          onChange={(e) =>
            updateField('tagline', e.target.value)
          }
        />

        <textarea
          placeholder="Address"
          className="w-full border rounded-lg p-3"
          rows={3}
          value={settings.address}
          onChange={(e) =>
            updateField('address', e.target.value)
          }
        />

        <input
          type="text"
          placeholder="Phone"
          className="w-full border rounded-lg p-3"
          value={settings.phone}
          onChange={(e) =>
            updateField('phone', e.target.value)
          }
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-lg p-3"
          value={settings.email}
          onChange={(e) =>
            updateField('email', e.target.value)
          }
        />

        <input
          type="text"
          placeholder="GSTIN"
          className="w-full border rounded-lg p-3"
          value={settings.gstin}
          onChange={(e) =>
            updateField('gstin', e.target.value)
          }
        />
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-6">
        <h2 className="text-xl font-semibold">
          Invoice Settings
        </h2>

        <input
          type="text"
          placeholder="Invoice Prefix"
          className="w-full border rounded-lg p-3"
          value={settings.invoice_prefix}
          onChange={(e) =>
            updateField(
              'invoice_prefix',
              e.target.value
            )
          }
        />

        <textarea
          placeholder="Invoice Footer"
          className="w-full border rounded-lg p-3"
          rows={3}
          value={settings.invoice_footer}
          onChange={(e) =>
            updateField(
              'invoice_footer',
              e.target.value
            )
          }
        />

        <input
          type="text"
          placeholder="Currency Symbol"
          className="w-full border rounded-lg p-3"
          value={settings.currency_symbol}
          onChange={(e) =>
            updateField(
              'currency_symbol',
              e.target.value
            )
          }
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}