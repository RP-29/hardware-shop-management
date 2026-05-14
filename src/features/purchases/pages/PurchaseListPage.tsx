import { useEffect, useState } from 'react'
import AppLayout from '../../../components/layout/AppLayout'
import PurchaseForm from '../components/PurchaseForm'
import { supabase } from '../../../lib/supabase'

interface Purchase {
  id: string
  quantity: number
  purchase_price: number
  total_amount: number
  created_at: string
  suppliers: {
    name: string
  } | null
  products: {
    name: string
  } | null
}

export default function PurchaseListPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchPurchases()
  }, [])

  async function fetchPurchases() {
    setLoading(true)

    const { data, error } = await supabase
      .from('purchases')
      .select(`
        id,
        quantity,
        purchase_price,
        total_amount,
        created_at,
        suppliers (
          name
        ),
        products (
          name
        )
      `)
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(error)
    } else {
      setPurchases(data || [])
    }

    setLoading(false)
  }

  const filteredPurchases = purchases.filter(
    (purchase) =>
      purchase.suppliers?.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      purchase.products?.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
  )

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Purchases
            </h1>
            <p className="text-gray-600 mt-1">
              Record supplier purchases and update stock automatically.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Purchase
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow p-4">
          <input
            type="text"
            placeholder="Search by supplier or product..."
            className="w-full border rounded-lg px-4 py-3"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {/* Purchases Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">
                    Date
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Supplier
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Product
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Quantity
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Purchase Price
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Total Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-6 text-center text-gray-500"
                    >
                      Loading purchases...
                    </td>
                  </tr>
                ) : filteredPurchases.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-6 text-center text-gray-500"
                    >
                      No purchases found.
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map(
                    (purchase) => (
                      <tr
                        key={purchase.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-4 text-gray-600">
                          {new Date(
                            purchase.created_at
                          ).toLocaleDateString()}
                        </td>

                        <td className="p-4 font-medium">
                          {purchase
                            .suppliers?.name ||
                            '-'}
                        </td>

                        <td className="p-4">
                          {purchase.products
                            ?.name || '-'}
                        </td>

                        <td className="p-4">
                          {purchase.quantity}
                        </td>

                        <td className="p-4">
                          ₹
                          {
                            purchase.purchase_price
                          }
                        </td>

                        <td className="p-4 font-semibold">
                          ₹
                          {purchase.total_amount}
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
          <PurchaseForm
            onSuccess={fetchPurchases}
            onClose={() =>
              setShowForm(false)
            }
          />
        )}
      </div>
    </AppLayout>
  )
}