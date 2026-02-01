import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addCategory, updateLinkCategory, addLink } from './actions';

const {
  mockInsert, mockUpdate, mockDelete, mockSelect, mockEq,
  mockSingle, mockMaybeSingle, mockFrom, mockAuthGetUser, mockRedirect
} = vi.hoisted(() => {
  return {
    mockInsert: vi.fn(),
    mockUpdate: vi.fn(),
    mockDelete: vi.fn(),
    mockSelect: vi.fn(),
    mockEq: vi.fn(),
    mockSingle: vi.fn(),
    mockMaybeSingle: vi.fn(),
    mockFrom: vi.fn(),
    mockAuthGetUser: vi.fn(),
    mockRedirect: vi.fn(),
  };
});

vi.mock('../utils/supabase/server', () => ({
  createClient: () => Promise.resolve({
    from: mockFrom,
    auth: {
      getUser: mockAuthGetUser,
    },
  }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

vi.mock('../utils/fetchTitle', () => ({
  fetchTitle: vi.fn().mockResolvedValue('Test Title'),
}));

describe('Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mocking the supabase client chain
    mockFrom.mockImplementation((tableName) => {
      const query = {
        select: vi.fn(() => query),
        eq: vi.fn((...args) => {
          mockEq(tableName, ...args); // Record calls to the global mockEq
          return query;
        }),
        insert: vi.fn((...args) => {
          mockInsert(...args); // Record calls to the global mockInsert
          return Promise.resolve({ error: null });
        }),
        update: vi.fn((...args) => {
          mockUpdate(...args); // Record calls to the global mockUpdate
          return query;
        }),
        delete: vi.fn((...args) => {
          mockDelete(...args); // Record calls to the global mockDelete
          return query;
        }),
        single: vi.fn(() => {
          if (tableName === 'categories') {
            return mockSingle(); // Use mockSingle for categories
          }
          return Promise.resolve({ data: null, error: new Error('Unexpected single() call') });
        }),
        maybeSingle: vi.fn(() => {
          if (tableName === 'links') {
            return mockMaybeSingle(); // Use mockMaybeSingle for links
          }
          return Promise.resolve({ data: null, error: new Error('Unexpected maybeSingle() call') });
        }),
      };
      return query;
    });

    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });

    // Default mock return values
    mockSingle.mockResolvedValue({ data: null, error: null });
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockInsert.mockResolvedValue({ error: null });
    mockUpdate.mockResolvedValue({ error: null });
    mockDelete.mockResolvedValue({ error: null });
  });

  describe('addCategory', () => {
    it('should insert a new category if it does not exist', async () => {
      const formData = new FormData();
      formData.append('name', 'Tech');

      await addCategory(formData);

      expect(mockFrom).toHaveBeenCalledWith('categories');
      expect(mockEq).toHaveBeenCalledWith('categories', 'name', 'Tech');
      expect(mockEq).toHaveBeenCalledWith('categories', 'user_id', 'user-123');
      expect(mockSingle).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalledWith({
        name: 'Tech',
        color: expect.any(String),
        user_id: 'user-123',
      });
    });

    it('should redirect if category already exists', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: 'cat-456' }, error: null });
      const formData = new FormData();
      formData.append('name', 'Tech');

      await addCategory(formData);

      expect(mockRedirect).toHaveBeenCalledWith('/?error=Such category already exists');
      expect(mockInsert).not.toHaveBeenCalled();
    });
  });

  describe('addLink', () => {
    it('should add a new link if it does not exist', async () => {
      const formData = new FormData();
      formData.append('url', 'https://example.com');

      await addLink(formData);

      expect(mockFrom).toHaveBeenCalledWith('links');
      expect(mockEq).toHaveBeenCalledWith('links', 'url', 'https://example.com');
      expect(mockEq).toHaveBeenCalledWith('links', 'user_id', 'user-123');
      expect(mockMaybeSingle).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalledWith({
        url: 'https://example.com',
        title: 'Test Title',
        user_id: 'user-123',
      });
    });

    it('should redirect if link already exists', async () => {
      mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'link-456' }, error: null });
      const formData = new FormData();
      formData.append('url', 'https://example.com');

      await addLink(formData);

      expect(mockRedirect).toHaveBeenCalledWith('/?error=Such article already saved');
      expect(mockInsert).not.toHaveBeenCalled();
    });
  });

  describe('updateLinkCategory', () => {
    it('should update link with new category id', async () => {
      const formData = new FormData();
      formData.append('linkId', 'link-1');
      formData.append('categoryId', 'cat-1');

      await updateLinkCategory(formData);

      expect(mockFrom).toHaveBeenCalledWith('links');
      expect(mockUpdate).toHaveBeenCalledWith({ category_id: 'cat-1' });
      expect(mockEq).toHaveBeenCalledWith('links', 'id', 'link-1');
    });

    it('should set category to null if categoryId is empty', async () => {
      const formData = new FormData();
      formData.append('linkId', 'link-1');
      formData.append('categoryId', '');

      await updateLinkCategory(formData);

      expect(mockUpdate).toHaveBeenCalledWith({ category_id: null });
      expect(mockEq).toHaveBeenCalledWith('links', 'id', 'link-1');
    });
  });
});