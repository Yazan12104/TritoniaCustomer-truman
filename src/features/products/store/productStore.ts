import { create } from 'zustand';
import { Product, Category } from '../types';
import { productsApi } from '../api/productsApi';
import { cacheService } from '../../../core/cache/cacheService';

interface ProductState {
  products: Product[];
  categories: Category[];
  activeCategoryId: string | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  pagination: { total: number; page: number; limit: number; pages: number } | null;

  fetchData: (page?: number, append?: boolean, options?: { force?: boolean }) => Promise<void>;
  setActiveCategory: (categoryId: string | null) => void;
  invalidateProductsCache: () => Promise<void>;
}

cacheService.init();

const buildCacheKey = (categoryId: string | null, page: number): string =>
  `products:${categoryId || 'all'}:${page}`;

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  activeCategoryId: null,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  pagination: null,

  fetchData: async (page = 1, append = false, options?: { force?: boolean }) => {
    const force = options?.force ?? false;
    const { activeCategoryId } = get();
    const cacheKey = buildCacheKey(activeCategoryId, page);

    if (!force && page === 1 && !append) {
      const cached = cacheService.get<{ products: Product[]; pagination: ProductState['pagination'] }>(cacheKey);
      if (cached) {
        set({
          products: cached.products,
          pagination: cached.pagination,
          isLoading: false,
          isLoadingMore: false,
          error: null,
        });
        return;
      }
    }

    if (!force && append && page > 1) {
      const cached = cacheService.get<{ products: Product[]; pagination: ProductState['pagination'] }>(cacheKey);
      if (cached) {
        set({
          products: [...get().products, ...cached.products].filter(
            (p, index, self) => index === self.findIndex((t) => t.id === p.id)
          ),
          pagination: cached.pagination,
          isLoading: false,
          isLoadingMore: false,
          error: null,
        });
        return;
      }
    }

    if (page === 1 && !append) {
      set({ isLoading: true, error: null });
    } else {
      set({ isLoadingMore: true, error: null });
    }

    try {
      const [categoriesResult, productsResult] = await Promise.allSettled([
        page === 1 ? productsApi.getCategories() : Promise.resolve(get().categories),
        productsApi.getProducts({ page, limit: 20, categoryId: activeCategoryId || undefined }),
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

      const uniqueProducts = products.filter((p, index, self) =>
        index === self.findIndex((t) => t.id === p.id)
      );

      const nextProducts = append
        ? [...get().products, ...uniqueProducts].filter((p, index, self) =>
            index === self.findIndex((t) => t.id === p.id)
          )
        : uniqueProducts;

      set({
        categories: categories.length > 0 ? categories : get().categories,
        products: nextProducts,
        pagination,
        isLoading: false,
        isLoadingMore: false,
      });

      cacheService.set(cacheKey, { products: uniqueProducts, pagination });
    } catch (err: any) {
      set({ error: err.message || 'فشل جلب البيانات', isLoading: false, isLoadingMore: false });
    }
  },

  setActiveCategory: (categoryId) => {
    if (get().activeCategoryId === categoryId) return;
    set({ activeCategoryId: categoryId, products: [], pagination: null, error: null });
    get().fetchData(1, false);
  },

  invalidateProductsCache: async () => {
    await cacheService.invalidate('products:');
  },
}));
