import { useEffect, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'

interface DashboardStats {
  totalSales: number
  totalPurchases: number
  netProfit: number
  lowStockItems: number
}

interface LowStockProduct {
  id: string
  name: string
  current_stock: number
  min_stock: number
}

interface TopSellingProduct {
  product_name: string
  total_quantity: number
}

interface RecentSale {
  id: string
  invoice_number: string | null
  customer_name?: string | null
  created_at: string
  grand_total: number | null
  total_amount: number | null
  customers: {
    name: string
  } | null
}

interface MonthlySalesData {
  month: string
  sales: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalPurchases: 0,
    netProfit: 0,
    lowStockItems: 0,
  })

  const [monthlySales, setMonthlySales] =
    useState<MonthlySalesData[]>([])

  const [recentSales, setRecentSales] =
    useState<RecentSale[]>([])

  const [topProducts, setTopProducts] = useState<
    TopSellingProduct[]
  >([])

  const [lowStockProducts, setLowStockProducts] =
    useState<LowStockProduct[]>([])

  const [loading, setLoading] = useState(true)

  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  async function fetchDashboardStats() {
    try {
      setLoading(true)

      // Total Sales
      const { data: salesData } = await supabase
        .from('sales')
        .select(
          'created_at, grand_total, total_amount'
        )

      const totalSales = (salesData || []).reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.grand_total ??
              sale.total_amount ??
              0
          ),
        0
      )

      // Total Purchases
      const { data: purchasesData } =
        await supabase
          .from('purchases')
          .select('total_amount')

      const totalPurchases = (
        purchasesData || []
      ).reduce(
        (sum, purchase) =>
          sum +
          Number(
            purchase.total_amount || 0
          ),
        0
      )

      // Products (Low Stock)
      const { data: productsData } =
        await supabase
          .from('products')
          .select(
            'id, name, current_stock, min_stock'
          )

      const lowStockList = (productsData || [])
        .filter(
          (product) =>
            Number(product.min_stock || 0) >
              0 &&
            Number(
              product.current_stock || 0
            ) <=
              Number(product.min_stock || 0)
        )
        .sort(
          (a, b) =>
            Number(a.current_stock) -
            Number(b.current_stock)
        )

      setLowStockProducts(
        lowStockList as LowStockProduct[]
      )

      const lowStockItems = lowStockList.length

      // Net Profit
      const netProfit =
        totalSales - totalPurchases

      // Top Selling Products
      const { data: saleItemsData } =
        await supabase
          .from('sale_items')
          .select(`
            quantity,
            products (
              name
            )
          `)

      const productMap = new Map<
        string,
        number
      >()

      ;(saleItemsData || []).forEach(
        (item: any) => {
          const productName =
            item.products?.name ||
            'Unknown Product'

          const quantity = Number(
            item.quantity || 0
          )

          productMap.set(
            productName,
            (productMap.get(productName) ||
              0) + quantity
          )
        }
      )

      const topSellingProducts = Array.from(
        productMap.entries()
      )
        .map(
          ([product_name, total_quantity]) => ({
            product_name,
            total_quantity,
          })
        )
        .sort(
          (a, b) =>
            b.total_quantity - a.total_quantity
        )
        .slice(0, 5)

      setTopProducts(topSellingProducts)

      // Recent Sales
      const { data: recentSalesData } =
        await supabase
          .from('sales')
          .select(`
            id,
            invoice_number,
            customer_name,
            created_at,
            grand_total,
            total_amount,
            customers (
              name
            )
          `)
          .order('created_at', {
            ascending: false,
          })
          .limit(5)

      setRecentSales(recentSalesData || [])

      // Monthly Sales Data
      const monthlyMap = new Map<
        string,
        number
      >()

      ;(salesData || []).forEach(
        (sale: any) => {
          if (!sale.created_at) return

          const date = new Date(
            sale.created_at
          )

          const month = date.toLocaleString(
            'en-IN',
            {
              month: 'short',
              year: '2-digit',
            }
          )

          const amount = Number(
            sale.grand_total ??
              sale.total_amount ??
              0
          )

          monthlyMap.set(
            month,
            (monthlyMap.get(month) || 0) +
              amount
          )
        }
      )

      const monthlySalesData = Array.from(
        monthlyMap.entries()
      ).map(([month, sales]) => ({
        month,
        sales,
      }))

      setMonthlySales(monthlySalesData)

      // Save Stats
      setStats({
        totalSales,
        totalPurchases,
        netProfit,
        lowStockItems,
      })
    } catch (error) {
      console.error(
        'Failed to load dashboard data:',
        error
      )
    } finally {
      setLoading(false)
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount)
  }

  function handleExportExcel() {
    const workbook = XLSX.utils.book_new()

    // Summary
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Sales', stats.totalSales],
      [
        'Total Purchases',
        stats.totalPurchases,
      ],
      ['Net Profit', stats.netProfit],
      [
        'Low Stock Items',
        stats.lowStockItems,
      ],
    ]

    const summarySheet =
      XLSX.utils.aoa_to_sheet(summaryData)

    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      'Summary'
    )

    // Top Selling Products
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(topProducts),
      'Top Selling Products'
    )

    // Low Stock Products
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        lowStockProducts
      ),
      'Low Stock'
    )

    // Recent Sales
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        recentSales.map((sale) => ({
          Invoice:
            sale.invoice_number || 'N/A',
          Customer:
            sale.customers?.name || '-',
          Amount:
            sale.grand_total ??
            sale.total_amount ??
            0,
          Date: new Date(
            sale.created_at
          ).toLocaleDateString(),
        }))
      ),
      'Recent Sales'
    )

    const fileName = `hardware-report-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`

    XLSX.writeFile(workbook, fileName)
  }

  async function handleExportPDF() {
    if (!reportRef.current) return

    try {
      const canvas = await html2canvas(
        reportRef.current,
        {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          onclone: (clonedDoc) => {
            // html2canvas does not support modern CSS color functions like oklch.
            // Replace them with safe fallback colors.
            const allElements = clonedDoc.querySelectorAll('*')

            allElements.forEach((el) => {
              const element = el as HTMLElement
              const computed = clonedDoc.defaultView?.getComputedStyle(element)

              if (!computed) return

              const properties = [
                'color',
                'backgroundColor',
                'borderTopColor',
                'borderRightColor',
                'borderBottomColor',
                'borderLeftColor',
              ]

              properties.forEach((prop) => {
                const value = (computed as any)[prop]

                if (
                  typeof value === 'string' &&
                  value.includes('oklch(')
                ) {
                  if (prop === 'backgroundColor') {
                    ;(element.style as any)[prop] = '#ffffff'
                  } else if (prop.startsWith('border')) {
                    ;(element.style as any)[prop] = '#d1d5db'
                  } else {
                    ;(element.style as any)[prop] = '#111827'
                  }
                }
              })
            })
          },
        }
      )

      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF('p', 'mm', 'a4')

      const pageWidth =
        pdf.internal.pageSize.getWidth()
      const pageHeight =
        pdf.internal.pageSize.getHeight()

      const margin = 10
      const usableWidth =
        pageWidth - margin * 2

      const imgHeight =
        (canvas.height * usableWidth) /
        canvas.width

      let heightLeft = imgHeight
      let position = margin

      // First page
      pdf.addImage(
        imgData,
        'PNG',
        margin,
        position,
        usableWidth,
        imgHeight
      )

      heightLeft -=
        pageHeight - margin * 2

      // Additional pages if needed
      while (heightLeft > 0) {
        position =
          heightLeft - imgHeight + margin

        pdf.addPage()
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          position,
          usableWidth,
          imgHeight
        )

        heightLeft -=
          pageHeight - margin * 2
      }

      const fileName = `dashboard-report-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`

      pdf.save(fileName)
    } catch (error) {
      console.error(
        'PDF generation failed:',
        error
      )
      alert(
        'Failed to generate PDF. Open the browser console (F12) to see the exact error.' 
      )
    }
  }

  return (
    <AppLayout>
      <div
        ref={reportRef}
        className="space-y-6 bg-white p-4 rounded-xl"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome to RK Enterprise
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Download Excel Report
            </button>

            <button
              onClick={handleExportPDF}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Download PDF Report
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Sales"
            value={
              loading
                ? 'Loading...'
                : formatCurrency(
                    stats.totalSales
                  )
            }
            color="bg-green-500"
          />

          <StatCard
            title="Total Purchases"
            value={
              loading
                ? 'Loading...'
                : formatCurrency(
                    stats.totalPurchases
                  )
            }
            color="bg-blue-500"
          />

          <StatCard
            title="Net Profit"
            value={
              loading
                ? 'Loading...'
                : formatCurrency(
                    stats.netProfit
                  )
            }
            color="bg-purple-500"
          />

          <StatCard
            title="Low Stock Items"
            value={
              loading
                ? 'Loading...'
                : String(
                    stats.lowStockItems
                  )
            }
            color="bg-red-500"
          />
        </div>

        {/* Top Selling Products */}
        <SectionCard title="Top Selling Products">
          {topProducts.length === 0 ? (
            <p className="text-gray-500">
              No sales data available.
            </p>
          ) : (
            <div className="space-y-3">
              {topProducts.map(
                (product, index) => (
                  <div
                    key={
                      product.product_name
                    }
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">
                        {
                          product.product_name
                        }
                      </span>
                    </div>

                    <span className="font-semibold text-gray-700">
                      {
                        product.total_quantity
                      }{' '}
                      sold
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </SectionCard>

        {/* Low Stock Products */}
        <SectionCard title="Low Stock Products">
          {lowStockProducts.length === 0 ? (
            <p className="text-gray-500">
              All products have
              sufficient stock.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">
                      Product
                    </th>
                    <th className="text-right py-2">
                      Current Stock
                    </th>
                    <th className="text-right py-2">
                      Minimum Stock
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map(
                    (product) => (
                      <tr
                        key={product.id}
                        className="border-b"
                      >
                        <td className="py-3 font-medium text-red-700">
                          {product.name}
                        </td>
                        <td className="py-3 text-right font-semibold text-red-600">
                          {
                            product.current_stock
                          }
                        </td>
                        <td className="py-3 text-right text-gray-600">
                          {product.min_stock}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {/* Recent Sales */}
        <SectionCard title="Recent Sales">
          {recentSales.length === 0 ? (
            <p className="text-gray-500">
              No recent sales available.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">
                      Invoice
                    </th>
                    <th className="text-left py-2">
                      Customer
                    </th>
                    <th className="text-right py-2">
                      Amount
                    </th>
                    <th className="text-right py-2">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-b"
                    >
                      <td className="py-3 font-medium text-blue-700">
                        {sale.invoice_number ||
                          'N/A'}
                      </td>
                      <td className="py-3 text-gray-900">
                        {sale.customer_name || sale.customers?.name ||
                          '-'}
                      </td>
                      <td className="py-3 text-right font-semibold">
                        {formatCurrency(
                          Number(
                            sale.grand_total ??
                              sale.total_amount ??
                              0
                          )
                        )}
                      </td>
                      <td className="py-3 text-right text-gray-600">
                        {new Date(
                          sale.created_at
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {/* Monthly Sales Trend */}
        <SectionCard title="Monthly Sales Trend">
          {monthlySales.length === 0 ? (
            <p className="text-gray-500">
              No sales data available.
            </p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={monthlySales}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(
                      value: number
                    ) =>
                      formatCurrency(value)
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#2563eb"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>
      </div>
    </AppLayout>
  )
}

interface StatCardProps {
  title: string
  value: string
  color: string
}

function StatCard({
  title,
  value,
  color,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <div
        className={`w-12 h-12 ${color} rounded-lg mb-4`}
      />
      <h3 className="text-sm font-medium text-gray-500">
        {title}
      </h3>
      <p className="text-2xl font-bold text-gray-900 mt-1 break-words">
        {value}
      </p>
    </div>
  )
}

interface SectionCardProps {
  title: string
  children: React.ReactNode
}

function SectionCard({
  title,
  children,
}: SectionCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        {title}
      </h2>
      {children}
    </div>
  )
}
