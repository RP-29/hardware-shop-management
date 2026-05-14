import { useEffect, useState } from 'react'
import AppLayout from '../../../components/layout/AppLayout'
import SupplierForm from '../components/SupplierForm'
import { supabase } from '../../../lib/supabase'

interface Supplier {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
}

export default function SupplierListPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedSupplier, setSelectedSupplier] =
    useState<Supplier | null>(null)

  useEffect(() => {
    fetchSuppliers()
  }, [])

  async function fetchSuppliers() {
    setLoading(true)

    const { data, error } = await supabase
      .from('suppliers')
      .select(
        'id, name, phone, email, address'
      )
      .order('name')

    if (error) {
      console.error(error)
    } else {
      setSuppliers(data || [])
    }

    setLoading(false)
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this supplier?'
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    fetchSuppliers()
  }

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (supplier.phone || '')
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (supplier.email || '')
        .toLowerCase()
        .includes(search.toLowerCase())
  )

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Suppliers
            </h1>
            <p className="text-gray-600 mt-1">
              Manage supplier information.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedSupplier(null)
              setShowForm(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Supplier
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow p-4">
          <input
            type="text"
            placeholder="Search suppliers..."
            className="w-full border rounded-lg px-4 py-3"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {/* Suppliers Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">
                    Supplier Name
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Phone
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Email
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-6 text-center text-gray-500"
                    >
                      Loading suppliers...
                    </td>
                  </tr>
                ) : filteredSuppliers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-6 text-center text-gray-500"
                    >
                      No suppliers found.
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map(
                    (supplier) => (
                      <tr
                        key={supplier.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-4 font-medium">
                          {supplier.name}
                        </td>
                        <td className="p-4 text-gray-600">
                          {supplier.phone ||
                            '-'}
                        </td>
                        <td className="p-4 text-gray-600">
                          {supplier.email ||
                            '-'}
                        </td>

                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedSupplier(
                                  supplier
                                )
                                setShowForm(true)
                              }}
                              className="bg-amber-500 text-white px-3 py-1 rounded hover:bg-amber-600 text-sm"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  supplier.id
                                )
                              }
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showForm && (
          <SupplierForm
            supplier={selectedSupplier}
            onSuccess={fetchSuppliers}
            onClose={() => {
              setShowForm(false)
              setSelectedSupplier(null)
            }}
          />
        )}
      </div>
    </AppLayout>
  )
}