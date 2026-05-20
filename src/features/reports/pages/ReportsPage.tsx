import { useEffect, useState } from 'react'
import AppLayout from '../../../components/layout/AppLayout'
import { supabase } from '../../../lib/supabase'

interface SummaryData {
  totalSales: number
  totalPurchases: number
  grossProfit: number
  customerOutstanding: number
  inventoryValue: number
}

export default function ReportsPage() {
  const today = new Date().toISOString().split('T')[0]
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  )
    .toISOString()
    .split('T')[0]

  const [fromDate, setFromDate] = useState(monthStart)
  const [toDate, setToDate] = useState(today)
  const [loading, setLoading] = useState(true)

  const [summary, setSummary] = useState<SummaryData>({
    totalSales: 0,
    totalPurchases: 0,
    grossProfit: 0,
    customerOutstanding: 0,
    inventoryValue: 0,
  })

  useEffect(() => {
    fetchReport()
  }, [])

  async function fetchReport() {
    setLoading(true)

    // Total Sales
    const { data: salesData } = await supabase
      .from('sales')
      .select('grand_total, created_at')
      .gte('created_at', `${fromDate}T00:00:00`)
      .lte('created_at', `${toDate}T23:59:59`)

    const totalSales = (salesData || []).reduce(
      (sum, row: any) =>
        sum + Number(row.grand_total || 0),
      0
    )

    
   // Total Purchases
    const { data: purchaseData } = await supabase
    .from('purchases')
    .select('total, created_at')
    .gte('created_at', `${fromDate}T00:00:00`)
    .lte('created_at', `${toDate}T23:59:59`)

    const totalPurchases = (purchaseData || []).reduce(
    (sum, row: any) =>
        sum + Number(row.total || 0),
    0
    )

    // Customer Outstanding
    const { data: dueData } = await supabase
      .from('sales')
      .select('balance_due')
      .gt('balance_due', 0)

    const customerOutstanding = (dueData || []).reduce(
      (sum, row: any) =>
        sum + Number(row.balance_due || 0),
      0
    )

    // Inventory Value (stock * purchase price)
   const { data: productData } = await supabase
  .from('products')
  .select('current_stock, purchase_price')

    const inventoryValue = (productData || []).reduce(
    (sum, row: any) =>
        sum +
        Number(row.current_stock || 0) *
        Number(row.purchase_price || 0),
    0
    )

    const grossProfit = totalSales - totalPurchases

    setSummary({
      totalSales,
      totalPurchases,
      grossProfit,
      customerOutstanding,
      inventoryValue,
    })

    setLoading(false)
  }

  function formatCurrency(amount: number) {
    return `₹${amount.toFixed(2)}`
  }

    

  return (
  <AppLayout>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Profit & Loss Report
        </h1>
        <p className="text-gray-600 mt-1">
          Analyze sales, purchases, profit, and inventory value.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(e.target.value)
              }
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(e.target.value)
              }
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? 'Loading...'
                : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="bg-white rounded-xl shadow p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 text-center">
          {/* Total Sales */}
          <div className="lg:border-r lg:border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              Total Sales
            </p>
            <p className="text-xl font-bold text-blue-600 whitespace-nowrap">
              {formatCurrency(summary.totalSales)}
            </p>
          </div>

          {/* Total Purchases */}
          <div className="lg:border-r lg:border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              Total Purchases
            </p>
            <p className="text-xl font-bold text-purple-600 whitespace-nowrap">
              {formatCurrency(
                summary.totalPurchases
              )}
            </p>
          </div>

          {/* Gross Profit */}
          <div className="lg:border-r lg:border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              Gross Profit
            </p>
            <p
              className={`text-xl font-bold whitespace-nowrap ${
                summary.grossProfit >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {formatCurrency(summary.grossProfit)}
            </p>
          </div>

          {/* Customer Outstanding */}
          <div className="lg:border-r lg:border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              Customer Outstanding
            </p>
            <p className="text-xl font-bold text-orange-600 whitespace-nowrap">
              {formatCurrency(
                summary.customerOutstanding
              )}
            </p>
          </div>

          {/* Inventory Value */}
          <div>
            <p className="text-sm text-gray-500 mb-2">
              Inventory Value
            </p>
            <p className="text-xl font-bold text-indigo-600 whitespace-nowrap">
              {formatCurrency(
                summary.inventoryValue
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Report Summary
        </h2>

        <div className="space-y-2 text-gray-700 text-center">
          <p>
            <strong>Sales:</strong>{' '}
            {formatCurrency(summary.totalSales)}
          </p>
          <p>
            <strong>Purchases:</strong>{' '}
            {formatCurrency(
              summary.totalPurchases
            )}
          </p>
          <p>
            <strong>Gross Profit:</strong>{' '}
            {formatCurrency(summary.grossProfit)}
          </p>
          <p>
            <strong>
              Outstanding Receivables:
            </strong>{' '}
            {formatCurrency(
              summary.customerOutstanding
            )}
          </p>
          <p>
            <strong>
              Current Inventory Value:
            </strong>{' '}
            {formatCurrency(
              summary.inventoryValue
            )}
          </p>
        </div>
      </div>
    </div>
  </AppLayout>
)
}