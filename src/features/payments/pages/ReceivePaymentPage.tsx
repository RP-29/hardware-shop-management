import { useEffect, useState } from 'react'
import AppLayout from '../../../components/layout/AppLayout'
import { supabase } from '../../../lib/supabase'

interface DueSale {
  id: string
  invoice_number: string | null
  grand_total: number
  amount_paid: number
  balance_due: number
  payment_status: string
  due_date: string | null
  customers: {
    id: string
    name: string
  } | null
}

export default function ReceivePaymentPage() {
  const [sales, setSales] = useState<DueSale[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSale, setSelectedSale] =
    useState<DueSale | null>(null)

  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] =
    useState('Cash')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  // Search state
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchDueSales()
  }, [])

  async function fetchDueSales() {
    setLoading(true)

    const { data, error } = await supabase
      .from('sales')
      .select(`
        id,
        invoice_number,
        grand_total,
        amount_paid,
        balance_due,
        payment_status,
        due_date,
        customers (
          id,
          name
        )
      `)
      .gt('balance_due', 0)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
    } else {
      setSales(data || [])
    }

    setLoading(false)
  }

  async function handleReceivePayment() {
    if (!selectedSale) return

    const paymentAmount = Number(amount || 0)

    if (paymentAmount <= 0) {
      alert('Enter a valid amount.')
      return
    }

    if (paymentAmount > selectedSale.balance_due) {
      alert('Payment exceeds balance due.')
      return
    }

    setSaving(true)

    const { error: paymentError } = await supabase
      .from('customer_payments')
      .insert([
        {
          customer_id:
            selectedSale.customers?.id,
          sale_id: selectedSale.id,
          amount: paymentAmount,
          payment_method: paymentMethod,
          notes: notes || null,
        },
      ])

    if (paymentError) {
      alert(paymentError.message)
      setSaving(false)
      return
    }

    const newAmountPaid =
      Number(selectedSale.amount_paid || 0) +
      paymentAmount

    const newBalanceDue =
      Number(selectedSale.balance_due || 0) -
      paymentAmount

    let newStatus = 'Partial'

    if (newBalanceDue <= 0) {
      newStatus = 'Paid'
    }

    const { error: saleError } = await supabase
      .from('sales')
      .update({
        amount_paid: newAmountPaid,
        balance_due: newBalanceDue,
        payment_status: newStatus,
      })
      .eq('id', selectedSale.id)

    if (saleError) {
      alert(saleError.message)
      setSaving(false)
      return
    }

    // Reset modal
    setSelectedSale(null)
    setAmount('')
    setPaymentMethod('Cash')
    setNotes('')

    await fetchDueSales()
    setSaving(false)
  }

  // Filter sales by invoice number or customer name
  const filteredSales = sales.filter((sale) => {
    const search = searchTerm.toLowerCase().trim()

    if (!search) return true

    const invoiceNumber =
      sale.invoice_number?.toLowerCase() || ''

    const customerName =
      sale.customers?.name?.toLowerCase() || ''

    return (
      invoiceNumber.includes(search) ||
      customerName.includes(search)
    )
  })

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Receive Payments
          </h1>
          <p className="text-gray-600 mt-1">
            Collect outstanding customer dues.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow p-4">
          <input
            type="text"
            placeholder="Search by customer name or invoice number..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="w-full border rounded-lg p-3"
          />
        </div>

        {/* Due Sales Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">
                    Invoice
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Customer
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Total
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Paid
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Balance
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Status
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Action
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
                      Loading...
                    </td>
                  </tr>
                ) : sales.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-6 text-center text-gray-500"
                    >
                      No outstanding dues.
                    </td>
                  </tr>
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-6 text-center text-gray-500"
                    >
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-b"
                    >
                      <td className="p-4 font-medium text-blue-700">
                        {sale.invoice_number || 'N/A'}
                      </td>
                      <td className="p-4">
                        {sale.customers?.name || '-'}
                      </td>
                      <td className="p-4">
                        ₹
                        {Number(
                          sale.grand_total || 0
                        ).toFixed(2)}
                      </td>
                      <td className="p-4">
                        ₹
                        {Number(
                          sale.amount_paid || 0
                        ).toFixed(2)}
                      </td>
                      <td className="p-4 font-semibold text-red-600">
                        ₹
                        {Number(
                          sale.balance_due || 0
                        ).toFixed(2)}
                      </td>
                      <td className="p-4">
                        {sale.payment_status}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() =>
                            setSelectedSale(sale)
                          }
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                        >
                          Receive Payment
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Modal */}
        {selectedSale && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
              <h2 className="text-2xl font-bold">
                Receive Payment
              </h2>

              <p>
                <strong>Customer:</strong>{' '}
                {selectedSale.customers?.name}
              </p>

              <p>
                <strong>Balance Due:</strong> ₹
                {Number(
                  selectedSale.balance_due
                ).toFixed(2)}
              </p>

              <input
                type="number"
                step="0.01"
                min="0"
                max={selectedSale.balance_due}
                placeholder="Payment Amount"
                className="w-full border rounded-lg p-3"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
              />

              <select
                className="w-full border rounded-lg p-3"
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">
                  Bank Transfer
                </option>
              </select>

              <textarea
                rows={3}
                placeholder="Notes (optional)"
                className="w-full border rounded-lg p-3"
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() =>
                    setSelectedSale(null)
                  }
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={handleReceivePayment}
                  disabled={saving}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : 'Save Payment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
