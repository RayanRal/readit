'use client'

import { updateLinkCategory } from '@/app/actions'
import { useState } from 'react'

type Category = {
  id: string
  name: string
  color: string
}

type Props = {
  linkId: string
  currentCategoryId: string | null
  categories: Category[]
}

export default function CategorySelector({ linkId, currentCategoryId, categories }: Props) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsUpdating(true)
    const newCategoryId = e.target.value
    
    const formData = new FormData()
    formData.append('linkId', linkId)
    formData.append('categoryId', newCategoryId)
    
    await updateLinkCategory(formData)
    setIsUpdating(false)
  }

  return (
    <div className="relative inline-block text-left">
      <select
        value={currentCategoryId || ''}
        onChange={handleChange}
        disabled={isUpdating}
        className={`block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
          isUpdating ? 'opacity-50' : ''
        }`}
        style={{
            // Optional: style the select background or text based on selected category color if desired
            // For now, simple standard select
        }}
      >
        <option value="">No Category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  )
}
