import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'

interface Customer {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  barcode?: string | null
  current_stock: number
  selling_price: number
}

interface SaleItem {
  product_id: string
  quantity: string
  selling_price: string
}

interface SaleFormProps {
  onSuccess: () => void
  onClose: () => void
}

export default function SaleForm({
  onSuccess,
  onClose,
}: SaleFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [customerId, setCustomerId] = useState('')
  const [notes, setNotes] = useState('')
  const [amountPaid, setAmountPaid] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [dueDate, setDueDate] = useState('')
  const [barcodeInput, setBarcodeInput] = useState('')

  const [items, setItems] = useState<SaleItem[]>([
    {
      product_id: '',
      quantity: '1',
      selling_price: '0',
    },
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCustomers()
    fetchProducts()
  }, [])

  async function fetchCustomers() {
    const { data } = await supabase
      .from('customers')
      .select('id, name')
      .order('name')

    setCustomers(data || [])
  }

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select(
        'id, name, barcode, current_stock, selling_price'
      )
      .order('name')

    setProducts(data || [])
  }

  function updateItem(
    index: number,
    field: keyof SaleItem,
    value: string
  ) {
    const updated = [...items]
    updated[index][field] = value

    if (field === 'product_id') {
      const product = products.find(
        (p) => p.id === value
      )

      if (product) {
        updated[index].selling_price = String(
          product.selling_price || 0
        )
      }
    }

    setItems(updated)
  }

  function addItem() {
    setItems([
      ...items,
      {
        product_id: '',
        quantity: '1',
        selling_price: '0',
      },
    ])
  }

  function removeItem(index: number) {
    if (items.length === 1) return
    setItems(
      items.filter((_, i) => i !== index)
    )
  }

  async function handleBarcodeScan(
    barcode: string
  ) {
    const cleanBarcode = barcode.trim()

    if (!cleanBarcode) return

    const product = products.find(
      (p) => p.barcode === cleanBarcode
    )

    if (!product) {
      setError(
        `Product not found for barcode: ${cleanBarcode}`
      )
      setBarcodeInput('')
      return
    }

    if (product.current_stock <= 0) {
      setError(
        `${product.name} is out of stock.`
      )
      setBarcodeInput('')
      return
    }

    setError('')

    setItems((prevItems) => {
      const existingIndex =
        prevItems.findIndex(
          (item) =>
            item.product_id === product.id
        )

      if (existingIndex >= 0) {
        const updated = [...prevItems]
        const currentQty =
          Number(
            updated[existingIndex]
              .quantity
          ) || 0

        if (
          currentQty + 1 >
          product.current_stock
        ) {
          setError(
            `Not enough stock for ${product.name}. Available: ${product.current_stock}`
          )
          return prevItems
        }

        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: String(
            currentQty + 1
          ),
        }

        return updated
      }

      const hasEmptyFirstRow =
        prevItems.length === 1 &&
        !prevItems[0].product_id

      if (hasEmptyFirstRow) {
        return [
          {
            product_id: product.id,
            quantity: '1',
            selling_price: String(
              product.selling_price || 0
            ),
          },
        ]
      }

      return [
        ...prevItems,
        {
          product_id: product.id,
          quantity: '1',
          selling_price: String(
            product.selling_price || 0
          ),
        },
      ]
    })

    setBarcodeInput('')
  }

  const grandTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const qty =
        Number(item.quantity) || 0
      const price =
        Number(item.selling_price) || 0
      return sum + qty * price
    }, 0)
  }, [items])


  const balanceDue = useMemo(() => {
    const paid = Number(amountPaid || 0)
    return Math.max(grandTotal - paid, 0)
  }, [grandTotal, amountPaid])

  const paymentStatus = useMemo(() => {
    if (balanceDue <= 0) return 'Paid'
    if (Number(amountPaid || 0) > 0) return 'Partial'
    return 'Unpaid'
  }, [balanceDue, amountPaid])

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!customerId) {
      setError(
        'Please select a customer.'
      )
      setLoading(false)
      return
    }

    const validItems = items.filter(
      (item) =>
        item.product_id &&
        (Number(item.quantity) || 0) > 0
    )

    if (validItems.length === 0) {
      setError(
        'Please add at least one valid item.'
      )
      setLoading(false)
      return
    }

    for (const item of validItems) {
      const product = products.find(
        (p) =>
          p.id === item.product_id
      )

      const qty =
        Number(item.quantity) || 0

      if (!product) {
        setError(
          'One of the selected products is invalid.'
        )
        setLoading(false)
        return
      }

      if (
        qty > product.current_stock
      ) {
        setError(
          `Not enough stock for ${product.name}. Available: ${product.current_stock}`
        )
        setLoading(false)
        return
      }
    }

    const { data: saleData, error: saleError } =
      await supabase
        .from('sales')
        .insert([
          {
            customer_id:
              customerId,
            subtotal:
              grandTotal,
            total_amount:
              grandTotal,
            grand_total:
              grandTotal,
            amount_paid:
              Number(amountPaid || 0),
            balance_due:
              balanceDue,
            payment_status:
              paymentStatus,
            payment_method:
              paymentMethod,
            due_date:
              dueDate || null,
            notes:
              notes || null,
          },
        ])
        .select('id')
        .single()

    if (saleError || !saleData) {
      setError(
        saleError?.message ||
          'Failed to create sale.'
      )
      setLoading(false)
      return
    }

    const saleId = saleData.id

    const saleItemsPayload =
      validItems.map((item) => {
        const qty =
          Number(item.quantity) || 0
        const price =
          Number(
            item.selling_price
          ) || 0

        return {
          sale_id: saleId,
          product_id:
            item.product_id,
          quantity: qty,
          selling_price:
            price,
          unit_price: price,
          total_amount:
            qty * price,
          line_total:
            qty * price,
        }
      })

    const { error: itemsError } =
      await supabase
        .from('sale_items')
        .insert(
          saleItemsPayload
        )

    if (itemsError) {
      setError(
        itemsError.message
      )
      setLoading(false)
      return
    }

    for (const item of validItems) {
      const product = products.find(
        (p) =>
          p.id === item.product_id
      )

      if (!product) continue

      const qty =
        Number(item.quantity) || 0
      const newStock =
        product.current_stock - qty

      const {
        error: stockError,
      } = await supabase
        .from('products')
        .update({
          current_stock:
            newStock,
        })
        .eq(
          'id',
          item.product_id
        )

      if (stockError) {
        setError(
          stockError.message
        )
        setLoading(false)
        return
      }
    }

    setLoading(false)
    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6"
        >
          <h2 className="text-2xl font-bold">
            Create Invoice
          </h2>

          {error && (
            <div className="rounded bg-red-100 p-3 text-red-700">
              {error}
            </div>
          )}

          <select
            className="w-full border rounded-lg p-3"
            value={customerId}
            onChange={(e) =>
              setCustomerId(
                e.target.value
              )
            }
            required
          >
            <option value="">
              Select Customer
            </option>
            {customers.map(
              (customer) => (
                <option
                  key={
                    customer.id
                  }
                  value={
                    customer.id
                  }
                >
                  {
                    customer.name
                  }
                </option>
              )
            )}
          </select>

          {/* Barcode Scan Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scan Barcode
            </label>

            <input
              type="text"
              placeholder="Scan or enter barcode and press Enter..."
              className="w-full border rounded-lg px-4 py-3"
              value={
                barcodeInput
              }
              onChange={(e) =>
                setBarcodeInput(
                  e.target.value
                )
              }
              onKeyDown={(
                e
              ) => {
                if (
                  e.key ===
                  'Enter'
                ) {
                  e.preventDefault()
                  handleBarcodeScan(
                    barcodeInput
                  )
                }
              }}
            />
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3">
                    Product
                  </th>
                  <th className="text-left p-3">
                    Available
                  </th>
                  <th className="text-left p-3">
                    Qty
                  </th>
                  <th className="text-left p-3">
                    Price
                  </th>
                  <th className="text-left p-3">
                    Total
                  </th>
                  <th className="text-left p-3">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map(
                  (
                    item,
                    index
                  ) => {
                    const product =
                      products.find(
                        (p) =>
                          p.id ===
                          item.product_id
                      )

                    const qty =
                      Number(
                        item.quantity
                      ) || 0
                    const price =
                      Number(
                        item.selling_price
                      ) || 0
                    const lineTotal =
                      qty * price

                    return (
                      <tr
                        key={
                          index
                        }
                        className="border-b"
                      >
                        <td className="p-3">
                          <select
                            className="w-full border rounded p-2"
                            value={
                              item.product_id
                            }
                            onChange={(
                              e
                            ) =>
                              updateItem(
                                index,
                                'product_id',
                                e.target
                                  .value
                              )
                            }
                          >
                            <option value="">
                              Select Product
                            </option>
                            {products.map(
                              (
                                product
                              ) => (
                                <option
                                  key={
                                    product.id
                                  }
                                  value={
                                    product.id
                                  }
                                >
                                  {
                                    product.name
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </td>

                        <td className="p-3 text-sm text-gray-600">
                          {product
                            ? product.current_stock
                            : '-'}
                        </td>

                        <td className="p-3">
                          <input
                            type="number"
                            min="1"
                            className="w-24 border rounded p-2"
                            value={
                              item.quantity
                            }
                            onChange={(
                              e
                            ) =>
                              updateItem(
                                index,
                                'quantity',
                                e.target
                                  .value
                              )
                            }
                          />
                        </td>

                        <td className="p-3">
                          <input
                            type="number"
                            step="0.01"
                            className="w-32 border rounded p-2"
                            value={
                              item.selling_price
                            }
                            onChange={(
                              e
                            ) =>
                              updateItem(
                                index,
                                'selling_price',
                                e.target
                                  .value
                              )
                            }
                          />
                        </td>

                        <td className="p-3 font-semibold">
                          ₹
                          {lineTotal.toFixed(
                            2
                          )}
                        </td>

                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                index
                              )
                            }
                            disabled={
                              items.length ===
                              1
                            }
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    )
                  }
                )}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Item
          </button>


          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Amount Paid
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full border rounded-lg p-3"
                value={amountPaid}
                onChange={(e) =>
                  setAmountPaid(e.target.value)
                }
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Payment Method
              </label>
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
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit">Credit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Due Date
              </label>
              <input
                type="date"
                className="w-full border rounded-lg p-3"
                value={dueDate}
                onChange={(e) =>
                  setDueDate(e.target.value)
                }
              />
            </div>
          </div>

          {/* Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg font-semibold text-blue-700">
              Amount Paid: ₹{Number(amountPaid || 0).toFixed(2)}
            </div>

            <div className="bg-orange-50 p-4 rounded-lg font-semibold text-orange-700">
              Balance Due: ₹{balanceDue.toFixed(2)}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg font-semibold text-gray-700">
              Status: {paymentStatus}
            </div>
          </div>

          <textarea
            placeholder="Notes (optional)"
            className="w-full border rounded-lg p-3"
            rows={3}
            value={notes}
            onChange={(e) =>
              setNotes(
                e.target.value
              )
            }
          />

          <div className="bg-green-50 rounded-lg p-4 text-xl font-bold text-green-700">
            Grand Total: ₹
            {grandTotal.toFixed(2)}
          </div>

          <div className="flex justify-end gap-3">
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
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading
                ? 'Saving...'
                : 'Save Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
