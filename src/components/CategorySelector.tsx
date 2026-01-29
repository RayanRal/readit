'use client'

import { updateLinkCategory } from '@/app/actions'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

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
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const currentCategory = categories.find(c => c.id === currentCategoryId)

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX
      })
    }
  }, [isOpen])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = async (categoryId: string | null) => {
    setIsUpdating(true)
    setIsOpen(false)
    
    const formData = new FormData()
    formData.append('linkId', linkId)
    formData.append('categoryId', categoryId || '')
    
    await updateLinkCategory(formData)
    setIsUpdating(false)
  }

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-1.5">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          disabled={isUpdating}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:text-indigo-600'
          } ${currentCategory ? '' : 'text-gray-500'}`}
          style={{
              color: currentCategory ? currentCategory.color : undefined
          }}
        >
          <span>Category</span>
          {currentCategory && (
            <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded" style={{ backgroundColor: `${currentCategory.color}15`, color: currentCategory.color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentCategory.color }}></span>
                {currentCategory.name}
            </span>
          )}
        </button>

        {currentCategoryId && (
          <button
            onClick={() => handleSelect(null)}
            disabled={isUpdating}
            className="p-0.5 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500 transition-colors"
            title="Remove category"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed z-[9999] w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1"
          style={{ 
            top: `${coords.top}px`, 
            left: `${coords.left}px`,
            transform: 'translateY(-100%) translateY(-4px)'
          }}
        >
          {categories.length === 0 ? (
            <div className="px-4 py-2 text-xs text-gray-500">No categories created</div>
          ) : (
            categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleSelect(category.id)}
                className={`flex items-center gap-2 w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors ${
                  currentCategoryId === category.id ? 'bg-gray-50 font-semibold' : 'text-gray-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }}></span>
                {category.name}
              </button>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  )
}
