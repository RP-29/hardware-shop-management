import { useEffect, useState } from 'react'
import AppLayout from '../../../components/layout/AppLayout'
import CategoryForm from '../components/CategoryForm'
import { supabase } from '../../../lib/supabase'

interface Category {
  id: string
  name: string
}

export default function CategoryListPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    setLoading(true)

    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name')

    if (error) {
      console.error(error)
    } else {
      setCategories(data || [])
    }

    setLoading(false)
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this category?'
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    fetchCategories()
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Categories
            </h1>
            <p className="text-gray-600 mt-1">
              Manage product categories.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedCategory(null)
              setShowForm(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Category
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow p-4">
          <input
            type="text"
            placeholder="Search categories..."
            className="w-full border rounded-lg px-4 py-3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">
                    Category Name
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
                      Loading categories...
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="p-6 text-center text-gray-500"
                    >
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-4 font-medium">
                        {category.name}
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedCategory(category)
                              setShowForm(true)
                            }}
                            className="bg-amber-500 text-white px-3 py-1 rounded hover:bg-amber-600 text-sm"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(category.id)
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
          <CategoryForm
            category={selectedCategory}
            onSuccess={fetchCategories}
            onClose={() => {
              setShowForm(false)
              setSelectedCategory(null)
            }}
          />
        )}
      </div>
    </AppLayout>
  )
}