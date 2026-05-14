import { useEffect, useState } from 'react'
import AppLayout from '../../../components/layout/AppLayout'
import BrandForm from '../components/BrandForm'
import { supabase } from '../../../lib/supabase'

interface Brand {
  id: string
  name: string
}

export default function BrandListPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedBrand, setSelectedBrand] =
    useState<Brand | null>(null)

  useEffect(() => {
    fetchBrands()
  }, [])

  async function fetchBrands() {
    setLoading(true)

    const { data, error } = await supabase
      .from('brands')
      .select('id, name')
      .order('name')

    if (error) {
      console.error(error)
    } else {
      setBrands(data || [])
    }

    setLoading(false)
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this brand?'
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    fetchBrands()
  }

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Brands
            </h1>
            <p className="text-gray-600 mt-1">
              Manage product brands.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedBrand(null)
              setShowForm(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Brand
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow p-4">
          <input
            type="text"
            placeholder="Search brands..."
            className="w-full border rounded-lg px-4 py-3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Brands Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">
                    Brand Name
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
                      colSpan={2}
                      className="p-6 text-center text-gray-500"
                    >
                      Loading brands...
                    </td>
                  </tr>
                ) : filteredBrands.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="p-6 text-center text-gray-500"
                    >
                      No brands found.
                    </td>
                  </tr>
                ) : (
                  filteredBrands.map((brand) => (
                    <tr
                      key={brand.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-4 font-medium">
                        {brand.name}
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedBrand(brand)
                              setShowForm(true)
                            }}
                            className="bg-amber-500 text-white px-3 py-1 rounded hover:bg-amber-600 text-sm"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(brand.id)
                            }
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>
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
          <BrandForm
            brand={selectedBrand}
            onSuccess={fetchBrands}
            onClose={() => {
              setShowForm(false)
              setSelectedBrand(null)
            }}
          />
        )}
      </div>
    </AppLayout>
  )
}