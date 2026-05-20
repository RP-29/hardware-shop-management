import { useEffect, useState } from 'react'
import AppLayout from '../../../components/layout/AppLayout'
import ProductForm from '../components/ProductForm'
import { supabase } from '../../../lib/supabase'
import Barcode from 'react-barcode'

interface Product {
  id: string
  name: string
  sku: string | null
  barcode: string | null
  current_stock: number
  purchase_price: number
  selling_price: number
  min_stock: number
  category_id?: string | null
  brand_id?: string | null
  categories?: {
    name: string
  } | null
  brands?: {
    name: string
  } | null
}

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null)

  // Barcode modal state
  const [selectedBarcode, setSelectedBarcode] =
    useState<string | null>(null)
  const [
    selectedProductName,
    setSelectedProductName,
  ] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)

    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        sku,
        barcode,
        current_stock,
        purchase_price,
        selling_price,
        min_stock,
        category_id,
        brand_id,
        categories (
          name
        ),
        brands (
          name
        )
      `)
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(error)
    } else {
      setProducts(data || [])
    }

    setLoading(false)
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this product?'
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    fetchProducts()
  }

  function handlePrintLabel() {
    window.print()
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (product.sku ?? '')
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (product.barcode ?? '')
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
              Inventory
            </h1>
            <p className="text-gray-600 mt-1">
              Manage products and stock.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedProduct(null)
              setShowForm(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Product
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow p-4">
          <input
            type="text"
            placeholder="Search by name, SKU or barcode..."
            className="w-full border rounded-lg px-4 py-3"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">
                    Product
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Category
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Brand
                  </th>
                  <th className="text-left p-4 font-semibold">
                    SKU
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Barcode
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Stock
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Purchase Price
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Selling Price
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
                      colSpan={9}
                      className="p-6 text-center text-gray-500"
                    >
                      Loading products...
                    </td>
                  </tr>
                ) : filteredProducts.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="p-6 text-center text-gray-500"
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(
                    (product) => (
                      <tr
                        key={product.id}
                        className={`border-b hover:bg-gray-50 ${
                          product.current_stock <=
                            product.min_stock &&
                          product.min_stock > 0
                            ? 'bg-red-50'
                            : ''
                        }`}
                      >
                        <td className="p-4 font-medium">
                          {product.name}
                        </td>

                        <td className="p-4 text-gray-600">
                          {product.categories
                            ?.name || '-'}
                        </td>

                        <td className="p-4 text-gray-600">
                          {product.brands
                            ?.name || '-'}
                        </td>

                        <td className="p-4 text-gray-600">
                          {product.sku || '-'}
                        </td>

                        <td className="p-4 text-gray-600 font-mono text-sm">
                          {product.barcode ||
                            '-'}
                        </td>

                        <td
                          className={`p-4 font-semibold ${
                            product.current_stock <=
                              product.min_stock &&
                            product.min_stock > 0
                              ? 'text-red-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {
                            product.current_stock
                          }
                        </td>

                        <td className="p-4">
                          ₹
                          {
                            product.purchase_price
                          }
                        </td>

                        <td className="p-4 font-semibold">
                          ₹
                          {
                            product.selling_price
                          }
                        </td>

                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => {
                                setSelectedBarcode(
                                  product.barcode ||
                                    ''
                                )
                                setSelectedProductName(
                                  product.name
                                )
                              }}
                              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                            >
                              Print Label
                            </button>

                            <button
                              onClick={() => {
                                setSelectedProduct(
                                  product
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
                                  product.id
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

        {/* Add/Edit Product Modal */}
        {showForm && (
          <ProductForm
            product={selectedProduct}
            onSuccess={fetchProducts}
            onClose={() => {
              setShowForm(false)
              setSelectedProduct(null)
            }}
          />
        )}

        {/* Barcode Label Modal */}
        {selectedBarcode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full text-center">
              <h2 className="text-xl font-bold mb-2">
                {selectedProductName}
              </h2>

              {/* Printable Area */}
              <div
                id="barcode-label"
                className="flex flex-col items-center my-4"
              >
                <Barcode
                  value={selectedBarcode}
                  width={1.5}
                  height={60}
                  fontSize={14}
                  displayValue={true}
                />
              </div>

              {/* Screen-only buttons (hidden when printing) */}
              <div className="flex justify-center gap-3 no-print">
                <button
                  onClick={handlePrintLabel}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Print
                </button>

                <button
                  onClick={() => {
                    setSelectedBarcode(null)
                    setSelectedProductName('')
                  }}
                  className="border px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}