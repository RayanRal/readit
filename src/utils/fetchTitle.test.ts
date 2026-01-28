import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchTitle } from './fetchTitle';

// Mock the global fetch function
const globalFetch = vi.fn();
global.fetch = globalFetch;

describe('fetchTitle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should extract title from a valid HTML response', async () => {
    // Mock successful response
    globalFetch.mockResolvedValue({
      ok: true,
      text: async () => '<html><head><title>Test Page Title</title></head><body></body></html>',
    });

    const title = await fetchTitle('https://example.com');
    expect(title).toBe('Test Page Title');
    expect(globalFetch).toHaveBeenCalledWith('https://example.com', expect.objectContaining({
      headers: expect.objectContaining({
        'User-Agent': expect.stringContaining('Mozilla/5.0 (compatible; Readit/0.1;')
      })
    }));
  });

  it('should return null if no title tag is found', async () => {
    globalFetch.mockResolvedValue({
      ok: true,
      text: async () => '<html><head></head><body>No title here</body></html>',
    });

    const title = await fetchTitle('https://example.com');
    expect(title).toBeNull();
  });

  it('should return null if the fetch fails (non-200 status)', async () => {
    globalFetch.mockResolvedValue({
      ok: false,
      status: 404,
    });

    const title = await fetchTitle('https://example.com');
    expect(title).toBeNull();
  });

  it('should return null if fetch throws an exception', async () => {
    globalFetch.mockRejectedValue(new Error('Network error'));

    const title = await fetchTitle('https://example.com');
    expect(title).toBeNull();
  });
});
