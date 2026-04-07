import { create } from 'zustand';
import { Product, Category } from '../types';
import { productsApi } from '../api/productsApi';

interface ProductState {
  products: Product[];
  categories: Category[];
  activeCategoryId: string | null;
  isLoading: boolean;
  error: string | null;
  pagination: { total: number; page: number; limit: number; pages: number } | null;

  fetchData: (page?: number) => Promise<void>;
  setActiveCategory: (categoryId: string | null) => void;
  getFilteredProducts: () => Product[];
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  activeCategoryId: null,
  isLoading: false,
  error: null,
  pagination: null,

  fetchData: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const [categoriesResult, productsResult] = await Promise.allSettled([
        productsApi.getCategories(),
        productsApi.getProducts({ page, limit: 100 }),
      ]);

      let categories: Category[] = [];
      if (categoriesResult.status === 'fulfilled') {
        categories = categoriesResult.value;
      } else {
        console.error('Failed to fetch categories:', categoriesResult.reason);
      }

      let products: Product[] = [];
      let pagination = null;
      if (productsResult.status === 'fulfilled') {
        products = productsResult.value.products;
        pagination = productsResult.value.pagination;
      } else {
        console.error('Failed to fetch products:', productsResult.reason);
        throw new Error('فشل جلب المنتجات');
      }
      
      // التأكد من عدم تكرار المنتجات بسبب الأخطاء في Join أو التكرار في البيانات
      const uniqueProducts = products.filter((p, index, self) => 
        index === self.findIndex((t) => t.id === p.id)
      );

      set({ 
        categories: categories.length > 0 ? categories : get().categories, 
        products: uniqueProducts, 
        pagination, 
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message || 'فشل جلب البيانات', isLoading: false });
    }
  },

  setActiveCategory: (categoryId) => {
    set({ activeCategoryId: categoryId });
  },

  getFilteredProducts: () => {
    const { products, activeCategoryId } = get();
    if (!activeCategoryId) return products;
    return products.filter((p) => p.category_id === activeCategoryId);
  },
}));