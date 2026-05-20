import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import jsPDF from 'jspdf'
import { supabase } from '../../../lib/supabase'

interface InvoiceItem {
  id: string
  quantity: number
  selling_price?: number | null
  unit_price?: number | null
  total_amount?: number | null
  line_total?: number | null
  products: {
    name: string
  } | null
}

interface Invoice {
  id: string
  invoice_number: string | null
  created_at: string
  grand_total?: number | null
  total_amount?: number | null
  notes?: string | null
  customers: {
    name: string
    phone?: string | null
    email?: string | null
    address?: string | null
  } | null
}

interface SettingsData {
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
  business_name: 'RK Enterprise',
  tagline: 'Hardware Shop Management System',
  address: '',
  phone: '',
  email: '',
  gstin: '',
  invoice_prefix: 'INV-',
  invoice_footer: 'Thank you for your purchase. Visit Again',
  currency_symbol: '₹',
}

export default function InvoicePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const printRef = useRef<HTMLDivElement>(null)

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [settings, setSettings] = useState<SettingsData>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchAllData(id)
    }
  }, [id])

  async function fetchAllData(invoiceId: string) {
    setLoading(true)
    await Promise.all([
      fetchInvoice(invoiceId),
      fetchSettings(),
    ])
    setLoading(false)
  }

  async function fetchSettings() {
    const { data } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (data) {
      setSettings({
        ...defaultSettings,
        ...data,
      })
    }
  }

  async function fetchInvoice(invoiceId: string) {
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('sales')
      .select(`
        id,
        invoice_number,
        created_at,
        grand_total,
        total_amount,
        notes,
        customers (
          name,
          phone,
          email,
          address
        )
      `)
      .eq('id', invoiceId)
      .single()

    if (invoiceError) {
      console.error(invoiceError)
      return
    }

    const { data: itemsData, error: itemsError } = await supabase
      .from('sale_items')
      .select(`
        id,
        quantity,
        selling_price,
        unit_price,
        total_amount,
        line_total,
        products (
          name
        )
      `)
      .eq('sale_id', invoiceId)

    if (itemsError) {
      console.error(itemsError)
    }

    setInvoice(invoiceData)
    setItems(itemsData || [])
  }

  function getItemPrice(item: InvoiceItem) {
    return Number(item.selling_price ?? item.unit_price ?? 0)
  }

  function getItemTotal(item: InvoiceItem) {
    return Number(item.line_total ?? item.total_amount ?? 0)
  }

  function getGrandTotal() {
    if (!invoice) return 0

    return Number(
      invoice.grand_total ??
        invoice.total_amount ??
        items.reduce(
          (sum, item) => sum + getItemTotal(item),
          0
        )
    )
  }

  function formatCurrency(amount: number) {
    return `${settings.currency_symbol}${amount.toFixed(2)}`
  }

  function handlePrint() {
    window.print()
  }

  async function handleDownloadPDF() {
    if (!invoice) return

    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      let y = 20

      // Company Header
      pdf.setFontSize(22)
      pdf.setFont(undefined, 'bold')
      pdf.text(settings.business_name || 'Business Name', 20, y)
      y += 10

      pdf.setFontSize(10)
      pdf.setFont(undefined, 'normal')

      if (settings.tagline) {
        pdf.text(settings.tagline, 20, y)
        y += 6
      }

      if (settings.address) {
        const addressLines = pdf.splitTextToSize(settings.address, 100)
        pdf.text(addressLines, 20, y)
        y += addressLines.length * 5
      }

      if (settings.phone) {
        pdf.text(`Phone: ${settings.phone}`, 20, y)
        y += 5
      }

      if (settings.email) {
        pdf.text(`Email: ${settings.email}`, 20, y)
        y += 5
      }

      if (settings.gstin) {
        pdf.text(`GSTIN: ${settings.gstin}`, 20, y)
        y += 5
      }

      // Invoice Title
      pdf.setFontSize(18)
      pdf.setFont(undefined, 'bold')
      pdf.text('INVOICE', 160, 20)

      y += 10

      // Invoice Details
      pdf.setFontSize(11)
      pdf.setFont(undefined, 'normal')
      pdf.text(`Invoice #: ${invoice.invoice_number || 'N/A'}`, 20, y)
      y += 6
      pdf.text(
        `Date: ${new Date(invoice.created_at).toLocaleDateString()}`,
        20,
        y
      )
      y += 10

      // Customer Details
      pdf.setFont(undefined, 'bold')
      pdf.text('Bill To:', 20, y)
      y += 6

      pdf.setFont(undefined, 'normal')
      pdf.text(invoice.customers?.name || 'Walk-in Customer', 20, y)
      y += 6

      if (invoice.customers?.phone) {
        pdf.text(`Phone: ${invoice.customers.phone}`, 20, y)
        y += 5
      }

      // Table Header
      y += 4
      pdf.setFont(undefined, 'bold')
      pdf.text('Product', 20, y)
      pdf.text('Qty', 120, y)
      pdf.text('Rate', 145, y)
      pdf.text('Amount', 170, y)
      pdf.line(20, y + 2, 190, y + 2)
      y += 8

      // Items
      pdf.setFont(undefined, 'normal')

      items.forEach((item) => {
        if (y > 270) {
          pdf.addPage()
          y = 20
        }

        pdf.text(item.products?.name || '-', 20, y)
        pdf.text(String(item.quantity), 120, y)
        pdf.text(formatCurrency(getItemPrice(item)), 145, y)
        pdf.text(formatCurrency(getItemTotal(item)), 170, y)
        y += 7
      })

      // Notes
      if (invoice.notes) {
        y += 5
        pdf.setFont(undefined, 'bold')
        pdf.text('Notes:', 20, y)
        y += 6
        pdf.setFont(undefined, 'normal')
        const noteLines = pdf.splitTextToSize(invoice.notes, 170)
        pdf.text(noteLines, 20, y)
        y += noteLines.length * 5
      }

      // Grand Total
      y += 8
      pdf.setFontSize(14)
      pdf.setFont(undefined, 'bold')
      pdf.text(
        `Grand Total: ${formatCurrency(getGrandTotal())}`,
        20,
        y
      )

      // Footer
      if (settings.invoice_footer) {
        pdf.setFontSize(10)
        pdf.setFont(undefined, 'normal')
        pdf.text(settings.invoice_footer, 20, 285)
      }

      pdf.save(`${invoice.invoice_number || 'invoice'}.pdf`)
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('Failed to generate PDF.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading invoice...</p>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">
        <p className="text-gray-600">Invoice not found.</p>
        <button
          onClick={() => navigate('/sales')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Back to Sales
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {/* Action Buttons */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap gap-3 justify-end print:hidden">
        <button
          onClick={() => navigate('/sales')}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          Back
        </button>

        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Print
        </button>

        <button
          onClick={handleDownloadPDF}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Download PDF
        </button>
      </div>

      {/* Printable Invoice */}
      <div
        ref={printRef}
        className="max-w-4xl mx-auto bg-white shadow rounded-xl p-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between gap-6 border-b pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {settings.business_name}
            </h1>

            {settings.tagline && (
              <p className="text-gray-600 mt-2">{settings.tagline}</p>
            )}

            {settings.address && (
              <p className="text-gray-600 mt-1 whitespace-pre-line">
                {settings.address}
              </p>
            )}

            {settings.phone && (
              <p className="text-gray-600 mt-1">Phone: {settings.phone}</p>
            )}

            {settings.email && (
              <p className="text-gray-600 mt-1">Email: {settings.email}</p>
            )}

            {settings.gstin && (
              <p className="text-gray-600 mt-1">GSTIN: {settings.gstin}</p>
            )}
          </div>

          <div className="text-left md:text-right">
            <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
            <p className="text-gray-600 mt-2">
              <strong>Invoice No.:</strong>{' '}
              {invoice.invoice_number || 'N/A'}
            </p>
            <p className="text-gray-600">
              <strong>Date:</strong>{' '}
              {new Date(invoice.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Customer Details */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Bill To</h3>

          <div className="text-gray-700 space-y-1">
            <p className="font-medium text-gray-900">
              {invoice.customers?.name || 'Walk-in Customer'}
            </p>

            {invoice.customers?.phone && (
              <p>Phone: {invoice.customers.phone}</p>
            )}

            {invoice.customers?.email && (
              <p>Email: {invoice.customers.email}</p>
            )}

            {invoice.customers?.address && (
              <p>Address: {invoice.customers.address}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 border-b">Product</th>
                <th className="text-right p-3 border-b">Qty</th>
                <th className="text-right p-3 border-b">Rate</th>
                <th className="text-right p-3 border-b">Amount</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="p-3 border-b">
                    {item.products?.name || '-'}
                  </td>
                  <td className="p-3 border-b text-right">
                    {item.quantity}
                  </td>
                  <td className="p-3 border-b text-right">
                    {formatCurrency(getItemPrice(item))}
                  </td>
                  <td className="p-3 border-b text-right font-medium">
                    {formatCurrency(getItemTotal(item))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {invoice.notes}
            </p>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-end">
          <div className="w-full max-w-sm">
            <div className="flex justify-between items-center bg-green-50 p-4 rounded-lg">
              <span className="text-xl font-semibold">Grand Total</span>
              <span className="text-2xl font-bold text-green-700">
                {formatCurrency(getGrandTotal())}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center text-gray-500 text-sm">
          {settings.invoice_footer}
        </div>
      </div>
    </div>
  )
}
