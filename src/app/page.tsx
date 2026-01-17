import { createClient } from '@/utils/supabase/server'
import { signOut, addLink, markAsRead, deleteLink } from './actions'

export default async function Dashboard() {
  const supabase = await createClient()

  // Verify user is authenticated (redundant if middleware works, but safe)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
      // Allow middleware to handle redirect, or render nothing
      return null; 
  }

  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('status', 'unread')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
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

      <main className="py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          
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
                    <div key={link.id} className="overflow-hidden rounded-lg bg-white shadow transition hover:shadow-md">
                        <div className="px-4 py-5 sm:p-6 flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="block focus:outline-none">
                                    <h3 className="truncate text-base font-semibold leading-6 text-gray-900 hover:text-indigo-600">
                                        {link.title || link.url}
                                    </h3>
                                    <p className="mt-1 truncate text-sm text-gray-500">{link.url}</p>
                                </a>
                                <p className="mt-2 text-xs text-gray-400">
                                    Added {new Date(link.created_at).toLocaleDateString()}
                                </p>
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
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No links saved</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding a URL above.</p>
                </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}