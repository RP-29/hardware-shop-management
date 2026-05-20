import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'

interface Supplier {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  current_stock: number
}

interface PurchaseFormProps {
  onSuccess: () => void
  onClose: () => void
}

export default function PurchaseForm({
  onSuccess,
  onClose,
}: PurchaseFormProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [supplierId, setSupplierId] = useState('')
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [notes, setNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSuppliers()
    fetchProducts()
  }, [])

  async function fetchSuppliers() {
    const { data, error } = await supabase
      .from('suppliers')
      .select('id, name')
      .order('name')

    if (error) {
      console.error('Error fetching suppliers:', error)
      return
    }

    setSuppliers(data || [])
  }

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, current_stock')
      .order('name')

    if (error) {
      console.error('Error fetching products:', error)
      return
    }

    setProducts(data || [])
  }

  const selectedProduct = products.find(
    (p) => p.id === productId
  )

  // Numeric conversions
  const qty = Number(quantity) || 0
  const price = Number(purchasePrice) || 0

  // Live total calculation
  const totalAmount = useMemo(() => {
    return qty * price
  }, [qty, price])

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!supplierId) {
      setError('Please select a supplier.')
      setLoading(false)
      return
    }

    if (!productId) {
      setError('Please select a product.')
      setLoading(false)
      return
    }

    if (qty <= 0) {
      setError('Please enter a valid quantity.')
      setLoading(false)
      return
    }

    if (price <= 0) {
      setError('Please enter a valid purchase price.')
      setLoading(false)
      return
    }

    if (totalAmount <= 0) {
      setError('Total amount must be greater than zero.')
      setLoading(false)
      return
    }

    // Save purchase
    // NOTE:
    // - Reports page reads from `total`
    // - Purchases list page may read from `total_amount`
    // Saving both guarantees both screens work.
    const { error: purchaseError } = await supabase
      .from('purchases')
      .insert([
        {
          supplier_id: supplierId,
          product_id: productId,
          quantity: qty,
          purchase_price: price,

          // For Reports module
          total: totalAmount,

          // For Purchases List page
          total_amount: totalAmount,

          paid_amount: 0,
          due_amount: totalAmount,
          notes: notes || null,
        },
      ])

    if (purchaseError) {
      console.error('Purchase insert error:', purchaseError)
      setError(purchaseError.message)
      setLoading(false)
      return
    }

    // Update stock
    const newStock =
      Number(selectedProduct?.current_stock || 0) + qty

    const { error: stockError } = await supabase
      .from('products')
      .update({
        current_stock: newStock,
      })
      .eq('id', productId)

    if (stockError) {
      console.error('Stock update error:', stockError)
      setError(stockError.message)
      setLoading(false)
      return
    }

    // Success
    setLoading(false)
    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4"
        >
          <h2 className="text-2xl font-bold">
            Add Purchase
          </h2>

          {error && (
            <div className="rounded bg-red-100 p-3 text-red-700">
              {error}
            </div>
          )}

          {/* Supplier */}
          <select
            className="w-full border rounded-lg p-3"
            value={supplierId}
            onChange={(e) =>
              setSupplierId(e.target.value)
            }
            required
          >
            <option value="">
              Select Supplier
            </option>
            {suppliers.map((supplier) => (
              <option
                key={supplier.id}
                value={supplier.id}
              >
                {supplier.name}
              </option>
            ))}
          </select>

          {/* Product */}
          <select
            className="w-full border rounded-lg p-3"
            value={productId}
            onChange={(e) =>
              setProductId(e.target.value)
            }
            required
          >
            <option value="">
              Select Product
            </option>
            {products.map((product) => (
              <option
                key={product.id}
                value={product.id}
              >
                {product.name}
              </option>
            ))}
          </select>

          {/* Quantity */}
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Quantity"
            className="w-full border rounded-lg p-3"
            value={quantity}
            onChange={(e) =>
              setQuantity(e.target.value)
            }
            required
          />

          {/* Purchase Price */}
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Purchase Price (Per Unit)"
            className="w-full border rounded-lg p-3"
            value={purchasePrice}
            onChange={(e) =>
              setPurchasePrice(
                e.target.value
              )
            }
            required
          />

          {/* Current Stock */}
          {selectedProduct && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              Current Stock:{' '}
              <strong>
                {selectedProduct.current_stock}
              </strong>
            </div>
          )}

          {/* Total */}
          <div className="bg-blue-50 rounded-lg p-3 font-semibold text-blue-700">
            Total Amount: ₹
            {totalAmount.toFixed(2)}
          </div>

          {/* Notes */}
          <textarea
            placeholder="Notes (optional)"
            className="w-full border rounded-lg p-3"
            rows={3}
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
          />

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
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
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? 'Saving...'
                : 'Save Purchase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
