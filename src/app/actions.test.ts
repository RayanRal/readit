import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addCategory, updateLinkCategory, addLink } from './actions';

const { 
  mockInsert, mockUpdate, mockEq, mockFrom, mockAuthGetUser, 
  mockSelect, mockSingle, mockRedirect 
} = vi.hoisted(() => {
  return {
    mockInsert: vi.fn(),
    mockUpdate: vi.fn(),
    mockEq: vi.fn(),
    mockFrom: vi.fn(),
    mockAuthGetUser: vi.fn(),
    mockSelect: vi.fn(),
    mockSingle: vi.fn(),
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

    mockFrom.mockImplementation(() => ({
      insert: mockInsert.mockResolvedValue({ error: null }),
      update: mockUpdate.mockImplementation(() => ({
        eq: mockEq.mockResolvedValue({ error: null }),
      })),
      select: mockSelect,
    }));

    mockSelect.mockImplementation(() => ({
      eq: mockEq,
    }));

    mockEq.mockImplementation(() => ({
      eq: mockEq,
      single: mockSingle,
    }));

    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });
    
    mockSingle.mockResolvedValue({ data: null, error: null });
  });

  describe('addCategory', () => {
    it('should insert a new category if it does not exist', async () => {
      const formData = new FormData();
      formData.append('name', 'Tech');

      await addCategory(formData);

      expect(mockSelect).toHaveBeenCalledWith('id');
      expect(mockEq).toHaveBeenCalledWith('name', 'Tech');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockSingle).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalled();
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
      
      expect(mockSelect).toHaveBeenCalledWith('id');
      expect(mockEq).toHaveBeenCalledWith('url', 'https://example.com');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockSingle).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should redirect if link already exists', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: 'link-456' }, error: null });
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