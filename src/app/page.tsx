import { createClient } from '@/utils/supabase/server'
import { signOut, addLink, markAsRead, deleteLink, addCategory, deleteCategory } from './actions'
import CategorySelector from '@/components/CategorySelector'
import Link from 'next/link'

export default async function Dashboard(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  // Verify user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
      return null; 
  }

  // Fetch Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  // Fetch Links
  let linksQuery = supabase
    .from('links')
    .select('*, categories(*)')
    .eq('status', 'unread')
    .order('created_at', { ascending: false })

  const selectedCategoryId = typeof searchParams.category === 'string' ? searchParams.category : undefined

  if (selectedCategoryId) {
      linksQuery = linksQuery.eq('category_id', selectedCategoryId)
  }

  const { data: links } = await linksQuery

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <span className="text-xl font-bold text-indigo-600">Readit</span>
              </div>
            </div>
            <div className="flex items-center">
                <span className="mr-4 text-sm text-gray-500">{user.email}</span>
                <form action={signOut}>
                    <button className="text-sm font-semibold text-gray-900 hover:text-gray-600">
                    Sign out
                    </button>
                </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
            
            {/* Sidebar (Categories) */}
            <aside className="w-full md:w-64 flex-shrink-0">
                <div className="bg-white rounded-lg shadow p-4 sticky top-24">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Categories</h2>
                    
                    <div className="space-y-1 mb-6">
                        <Link 
                            href="/" 
                            className={`block px-3 py-2 rounded-md text-sm font-medium ${!selectedCategoryId ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            Show All
                        </Link>
                        {categories?.map((cat) => (
                            <div key={cat.id} className="group flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                                <Link 
                                    href={`/?category=${cat.id}`}
                                    className={`flex items-center gap-2 flex-1 ${selectedCategoryId === cat.id ? 'text-indigo-700 font-bold' : 'text-gray-700'}`}
                                >
                                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }}></span>
                                    <span className="truncate">{cat.name}</span>
                                </Link>
                                <form action={deleteCategory} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <input type="hidden" name="id" value={cat.id} />
                                    <button 
                                        type="submit"
                                        className="p-1 hover:text-red-600 text-gray-400 transition-colors"
                                        title="Delete Category"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Add Category</h3>
                        <form action={addCategory} className="space-y-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Category Name"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                                <button
                                    type="submit"
                                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    Add
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
                {/* Add Link Section */}
                <div className="mb-8">
                    <form action={addLink} className="relative mt-2 flex items-center rounded-md bg-white shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
                        <input
                        type="url"
                        name="url"
                        id="url"
                        required
                        className="block w-full border-0 bg-transparent py-3 pl-4 pr-20 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="https://example.com/article-to-read"
                        />
                        <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                            <button
                                type="submit"
                                className="inline-flex items-center rounded bg-indigo-600 px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>

                {/* Links List */}
                <div className="space-y-4">
                    {links && links.length > 0 ? (
                        links.map((link) => (
                            <div key={link.id} className="overflow-hidden rounded-lg bg-white shadow transition hover:shadow-md" style={{ borderLeft: link.categories ? `4px solid ${link.categories.color}` : '4px solid transparent' }}>
                                <div className="px-4 py-5 sm:p-6 flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="block focus:outline-none group">
                                            <h3 className="truncate text-base font-semibold leading-6 text-gray-900 group-hover:text-indigo-600">
                                                {link.title ? link.title.slice(0, 90) : link.url}
                                            </h3>
                                            <p className="mt-1 truncate text-sm text-gray-500">{link.url}</p>
                                        </a>
                                        <div className="mt-3 flex items-center gap-4">
                                            <p className="text-xs text-gray-400">
                                                Added {new Date(link.created_at).toLocaleDateString()}
                                            </p>
                                            
                                            {/* Category Selector */}
                                            <div className="flex items-center gap-2">
                                                <CategorySelector 
                                                    linkId={link.id} 
                                                    currentCategoryId={link.category_id}
                                                    categories={categories || []}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-shrink-0 gap-2">
                                        <form action={markAsRead}>
                                            <input type="hidden" name="id" value={link.id} />
                                            <button 
                                                type="submit"
                                                className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                                title="Mark as read"
                                            >
                                                Archive
                                            </button>
                                        </form>
                                        <form action={deleteLink}>
                                            <input type="hidden" name="id" value={link.id} />
                                            <button 
                                                type="submit"
                                                className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-red-50"
                                                title="Delete"
                                            >
                                                Delete
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No links found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {selectedCategoryId ? 'Try selecting a different category or "Show All".' : 'Get started by adding a URL above.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </main>
    </div>
  )
}