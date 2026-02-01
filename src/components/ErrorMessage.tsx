'use client'
import { useSearchParams } from 'next/navigation'

export function ErrorMessage() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    if (!error) return null

    return (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md z-50">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
        </div>
    )
}