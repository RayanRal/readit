'use client'
import { useEffect } from 'react'

export function ErrorMessage({ error }: { error: string | undefined }) {
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                // To clear the error from the URL, we can redirect to the same page without the error param
                // This will cause a full page refresh, which is not ideal, but it's simple
                // Alternatively, we could use a client-side routing solution
                window.location.replace(window.location.pathname);
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [error])

    if (!error) return null

    return (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md z-50">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
        </div>
    )
}