import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addCategory, updateLinkCategory, getCategoryColors } from './actions';

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

vi.mock('../utils/supabase/server', () => ({
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
    it('should insert a new category with a random color from getCategoryColors', async () => {
      const formData = new FormData();
      formData.append('name', 'Tech');

      await addCategory(formData);

      expect(mockFrom).toHaveBeenCalledWith('categories');
      const calledWith = mockInsert.mock.calls[0][0];
      expect(calledWith.name).toBe('Tech');
      const colors = await getCategoryColors();
      expect(colors).toContain(calledWith.color);
      expect(calledWith.user_id).toBe('user-123');
    });

    it('should ignore provided color and use random color', async () => {
      const formData = new FormData();
      formData.append('name', 'Life');
      formData.append('color', '#000000');

      await addCategory(formData);

      const calledWith = mockInsert.mock.calls[0][0];
      expect(calledWith.name).toBe('Life');
      const colors = await getCategoryColors();
      expect(colors).toContain(calledWith.color);
      expect(calledWith.color).not.toBe('#000000');
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