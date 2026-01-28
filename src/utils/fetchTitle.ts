export async function fetchTitle(url: string): Promise<string | null> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': `Mozilla/5.0 (compatible; Readit/0.1; +${siteUrl})`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const text = await response.text();
    const match = text.match(/<title[^>]*>([^<]+)<\/title>/i);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching title for url:', url, error);
    return null;
  }
}
