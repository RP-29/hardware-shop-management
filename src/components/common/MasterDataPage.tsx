import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface Props {
  title: string
  tableName: string
  placeholder: string
}

interface Item {
  id: string
  name: string
}

export default function MasterDataPage({
  title,
  tableName,
  placeholder,
}: Props) {
  const [items, setItems] = useState<Item[]>([])
  const [value, setValue] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    const { data, error } = await supabase
      .from(tableName)
      .select('id, name')
      .order('name')

    if (error) {
      console.error(error)
      alert(error.message)
      return
    }

    setItems(data || [])
  }

  async function handleSave() {
    if (!value.trim()) return

    if (editingId) {
      const { error } = await supabase
        .from(tableName)
        .update({
          name: value.trim(),
        })
        .eq('id', editingId)

      if (error) {
        alert(error.message)
        return
      }
    } else {
      const { error } = await supabase
        .from(tableName)
        .insert([
          {
            name: value.trim(),
          },
        ])

      if (error) {
        alert(error.message)
        return
      }
    }

    setValue('')
    setEditingId(null)
    fetchItems()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this item?')) return

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    fetchItems()
  }

  function handleEdit(item: Item) {
    setValue(item.name)
    setEditingId(item.id)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          {title}
        </h1>
        <p className="text-gray-600 mt-2">
          Manage {title.toLowerCase()}.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) =>
              setValue(e.target.value)
            }
            className="flex-1 border rounded-lg p-3"
          />

          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            {editingId ? 'Update' : 'Add'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-semibold">
                Name
              </th>
              <th className="text-left p-4 font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="p-6 text-center text-gray-500"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b"
                >
                  <td className="p-4">
                    {item.name}
                  </td>

                  <td className="p-4 space-x-2">
                    <button
                      onClick={() =>
                        handleEdit(item)
                      }
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(item.id)
                      }
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}