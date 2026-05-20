import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

interface Product {
  id: string
  name: string
  sku: string | null
  barcode?: string | null
  current_stock: number
  purchase_price: number
  selling_price: number
  min_stock: number
  category_id: string | null
  brand_id: string | null
}

interface Category {
  id: string
  name: string
}

interface Brand {
  id: string
  name: string
}

interface ProductFormProps {
  onSuccess: () => void
  onClose: () => void
  product?: Product | null
}

export default function ProductForm({
  onSuccess,
  onClose,
  product,
}: ProductFormProps) {
  const [name, setName] = useState(
    product?.name ?? ''
  )
  const [sku, setSku] = useState(
    product?.sku ?? ''
  )
  const [purchasePrice, setPurchasePrice] =
    useState(
      product?.purchase_price?.toString() ??
        ''
    )
  const [sellingPrice, setSellingPrice] =
    useState(
      product?.selling_price?.toString() ??
        ''
    )
  const [openingStock, setOpeningStock] =
    useState(
      product?.current_stock?.toString() ??
        ''
    )
  const [minStock, setMinStock] = useState(
    product?.min_stock?.toString() ?? ''
  )

  const [categories, setCategories] =
    useState<Category[]>([])
  const [categoryId, setCategoryId] =
    useState(product?.category_id ?? '')

  const [brands, setBrands] =
    useState<Brand[]>([])
  const [brandId, setBrandId] = useState(
    product?.brand_id ?? ''
  )

  const [loading, setLoading] =
    useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchBrands()
  }, [])

  async function fetchCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name')

    if (error) {
      console.error(error)
      return
    }

    setCategories(data || [])
  }

  async function fetchBrands() {
    const { data, error } = await supabase
      .from('brands')
      .select('id, name')
      .order('name')

    if (error) {
      console.error(error)
      return
    }

    setBrands(data || [])
  }

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    let dbError: string | null = null

    if (product) {
      // Edit existing product
      // Keep existing barcode unchanged
      const { error } = await supabase
        .from('products')
        .update({
          name,
          sku: sku || null,
          category_id:
            categoryId || null,
          brand_id: brandId || null,
          purchase_price:
            Number(purchasePrice) || 0,
          selling_price:
            Number(sellingPrice) || 0,
          current_stock:
            Number(openingStock) || 0,
          min_stock:
            Number(minStock) || 0,
        })
        .eq('id', product.id)

      dbError = error?.message ?? null
    } else {
      // Create new product
      // Automatically generate barcode
      const { error } = await supabase
        .from('products')
        .insert([
          {
            name,
            sku: sku || null,
            barcode: `PRD-${Date.now()}`,
            category_id:
              categoryId || null,
            brand_id: brandId || null,
            purchase_price:
              Number(purchasePrice) || 0,
            selling_price:
              Number(sellingPrice) || 0,
            current_stock:
              Number(openingStock) || 0,
            min_stock:
              Number(minStock) || 0,
          },
        ])

      dbError = error?.message ?? null
    }

    setLoading(false)

    if (dbError) {
      setError(dbError)
      return
    }

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
            {product
              ? 'Edit Product'
              : 'Add Product'}
          </h2>

          {error && (
            <div className="rounded bg-red-100 p-3 text-red-700">
              {error}
            </div>
          )}

          {/* Product Name */}
          <input
            type="text"
            placeholder="Product Name"
            className="w-full border rounded-lg p-3"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
          />

          {/* SKU */}
          <input
            type="text"
            placeholder="SKU"
            className="w-full border rounded-lg p-3"
            value={sku}
            onChange={(e) =>
              setSku(e.target.value)
            }
          />

          {/* Category */}
          <select
            className="w-full border rounded-lg p-3"
            value={categoryId}
            onChange={(e) =>
              setCategoryId(
                e.target.value
              )
            }
          >
            <option value="">
              Select Category
            </option>
            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              )
            )}
          </select>

          {/* Brand */}
          <select
            className="w-full border rounded-lg p-3"
            value={brandId}
            onChange={(e) =>
              setBrandId(
                e.target.value
              )
            }
          >
            <option value="">
              Select Brand
            </option>
            {brands.map((brand) => (
              <option
                key={brand.id}
                value={brand.id}
              >
                {brand.name}
              </option>
            ))}
          </select>

          {/* Purchase Price */}
          <input
            type="number"
            step="0.01"
            placeholder="Purchase Price"
            className="w-full border rounded-lg p-3"
            value={purchasePrice}
            onChange={(e) =>
              setPurchasePrice(
                e.target.value
              )
            }
          />

          {/* Selling Price */}
          <input
            type="number"
            step="0.01"
            placeholder="Selling Price"
            className="w-full border rounded-lg p-3"
            value={sellingPrice}
            onChange={(e) =>
              setSellingPrice(
                e.target.value
              )
            }
          />

          {/* Opening Stock */}
          <input
            type="number"
            step="0.01"
            placeholder="Opening Stock"
            className="w-full border rounded-lg p-3"
            value={openingStock}
            onChange={(e) =>
              setOpeningStock(
                e.target.value
              )
            }
          />

          {/* Minimum Stock */}
          <input
            type="number"
            step="0.01"
            placeholder="Minimum Stock"
            className="w-full border rounded-lg p-3"
            value={minStock}
            onChange={(e) =>
              setMinStock(
                e.target.value
              )
            }
          />

          {/* Action Buttons */}
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
                : product
                  ? 'Update Product'
                  : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}