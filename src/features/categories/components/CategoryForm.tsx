import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

interface Category {
  id: string
  name: string
}

interface CategoryFormProps {
  onSuccess: () => void
  onClose: () => void
  category?: Category | null
}

export default function CategoryForm({
  onSuccess,
  onClose,
  category,
}: CategoryFormProps) {
  const [name, setName] = useState(category?.name ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    let dbError: string | null = null

    if (category) {
      const { error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', category.id)

      dbError = error?.message ?? null
    } else {
      const { error } = await supabase
        .from('categories')
        .insert([{ name }])

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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">
            {category ? 'Edit Category' : 'Add Category'}
          </h2>

          {error && (
            <div className="rounded bg-red-100 p-3 text-red-700">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Category Name"
            className="w-full border rounded-lg p-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
                : category
                  ? 'Update Category'
                  : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}