import { useEffect, useState } from 'react'
import AppLayout from '../../../components/layout/AppLayout'
import SaleForm from '../components/SaleForm'
import { supabase } from '../../../lib/supabase'
import { Link } from 'react-router-dom'

interface Sale {
  id: string
  invoice_number: string | null
  customer_name: string | null
  grand_total: number
  created_at: string

  customers: {
    name: string
  } | null
}

export default function SaleListPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchSales()
  }, [])

  async function fetchSales() {
    setLoading(true)

    const { data, error } = await supabase
      .from('sales')
      .select(`
        id,
        invoice_number,
        customer_name,
        grand_total,
        created_at,
        customers (
          name
        )
      `)
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(error)
    } else {
      setSales(data || [])
    }

    setLoading(false)
  }

  const filteredSales = sales.filter((sale) =>
    (
      sale.customer_name ||
      sale.customers?.name ||
      ''
    )
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
              Sales
            </h1>
            <p className="text-gray-600 mt-1">
              Record customer sales and reduce stock automatically.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            + Add Sale
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow p-4">
          <input
            type="text"
            placeholder="Search by customer or product..."
            className="w-full border rounded-lg px-4 py-3"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">
                    Date
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Invoice No.
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Customer
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Grand Total
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Invoice
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-6 text-center text-gray-500"
                    >
                      Loading sales...
                    </td>
                  </tr>
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-6 text-center text-gray-500"
                    >
                      No sales found.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-4 text-gray-600">
                        {new Date(
                          sale.created_at
                        ).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {sale.invoice_number || 'N/A'}
                      </td>

                      <td className="p-4 font-medium">
                        {sale.customer_name ||
                          sale.customers?.name ||
                          'Walk-in Customer'}
                      </td>

                      <td className="p-4 font-semibold">
                        ₹{sale.grand_total}
                      </td>

                      <td className="p-4">
                        <Link
                            to={`/invoice/${sale.id}`}
                            className="inline-block whitespace-nowrap bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
                        >
                            View Invoice
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showForm && (
          <SaleForm
            onSuccess={fetchSales}
            onClose={() =>
              setShowForm(false)
            }
          />
        )}
      </div>
    </AppLayout>
  )
}