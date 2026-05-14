import { useEffect, useState } from 'react'
import AppLayout from '../../../components/layout/AppLayout'
import CustomerForm from '../components/CustomerForm'
import { supabase } from '../../../lib/supabase'

interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
}

export default function CustomerListPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null)

  useEffect(() => {
    fetchCustomers()
  }, [])

  async function fetchCustomers() {
    setLoading(true)

    const { data, error } = await supabase
      .from('customers')
      .select(
        'id, name, phone, email, address'
      )
      .order('name')

    if (error) {
      console.error(error)
    } else {
      setCustomers(data || [])
    }

    setLoading(false)
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this customer?'
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    fetchCustomers()
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (customer.phone || '')
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (customer.email || '')
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
              Customers
            </h1>
            <p className="text-gray-600 mt-1">
              Manage customer information.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedCustomer(null)
              setShowForm(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Customer
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow p-4">
          <input
            type="text"
            placeholder="Search customers..."
            className="w-full border rounded-lg px-4 py-3"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">
                    Customer Name
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
                      Loading customers...
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-6 text-center text-gray-500"
                    >
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map(
                    (customer) => (
                      <tr
                        key={customer.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-4 font-medium">
                          {customer.name}
                        </td>
                        <td className="p-4 text-gray-600">
                          {customer.phone ||
                            '-'}
                        </td>
                        <td className="p-4 text-gray-600">
                          {customer.email ||
                            '-'}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedCustomer(
                                  customer
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
                                  customer.id
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
          <CustomerForm
            customer={selectedCustomer}
            onSuccess={fetchCustomers}
            onClose={() => {
              setShowForm(false)
              setSelectedCustomer(null)
            }}
          />
        )}
      </div>
    </AppLayout>
  )
}