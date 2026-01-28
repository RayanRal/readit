import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addCategory, updateLinkCategory } from './actions';

// Use vi.hoisted to ensure mocks are available before vi.mock execution
const { mockInsert, mockUpdate, mockEq, mockFrom, mockAuthGetUser } = vi.hoisted(() => {
  return {
    mockInsert: vi.fn(),
    mockUpdate: vi.fn(),
    mockEq: vi.fn(),
    mockFrom: vi.fn(),
    mockAuthGetUser: vi.fn(),
  };
});

const mockSupabase = {
  from: mockFrom,
  auth: {
    getUser: mockAuthGetUser,
  },
};

vi.mock('@/utils/supabase/server', () => ({
  createClient: () => Promise.resolve(mockSupabase),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Explicit chain setup
    mockFrom.mockImplementation(() => ({
      insert: mockInsert,
      update: mockUpdate,
      delete: () => ({ eq: mockEq }),
    }));
    
    // mockUpdate returns the builder synchronously
    mockUpdate.mockImplementation(() => ({
      eq: mockEq,
    }));
    
    // Final terminals return promises
    mockInsert.mockResolvedValue({ error: null });
    mockEq.mockResolvedValue({ error: null }); 
    
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });
  });

  describe('addCategory', () => {
    it('should insert a new category with provided name and color', async () => {
      const formData = new FormData();
      formData.append('name', 'Tech');
      formData.append('color', '#ff0000');

      await addCategory(formData);

      expect(mockFrom).toHaveBeenCalledWith('categories');
      expect(mockInsert).toHaveBeenCalledWith({
        name: 'Tech',
        color: '#ff0000',
        user_id: 'user-123',
      });
    });

    it('should use default color if not provided', async () => {
      const formData = new FormData();
      formData.append('name', 'Life');
      // No color

      await addCategory(formData);

      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Life',
        color: '#6366f1',
      }));
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
      expect(mockEq).toHaveBeenCalledWith('id', 'link-1');
    });

    it('should set category to null if categoryId is empty', async () => {
      const formData = new FormData();
      formData.append('linkId', 'link-1');
      formData.append('categoryId', '');

      await updateLinkCategory(formData);

      expect(mockUpdate).toHaveBeenCalledWith({ category_id: null });
    });
  });
});
