import { apiClient } from '../../../core/api/apiClient';
import { BASE_URL, USE_MOCK_API } from '../../../config/env';
import { Product, Category, ProductImage } from '../types';

// Helper لبناء رابط الصورة الكامل
const getFullImageUrl = (relativePath: string): string => {
  if (!relativePath) return 'https://via.placeholder.com/300x300?text=No+Image';
  if (relativePath.startsWith('http')) return relativePath;
  // إزالة أي斜杠 زائد
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${BASE_URL}${cleanPath}`;
};

// Mappers
const mapCategory = (apiData: any): Category => ({
  id: apiData.id || '',
  name: apiData.name || '',
});

const mapProductImage = (apiData: any): ProductImage => ({
  id: apiData.id || '',
  product_id: apiData.product_id || '',
  image_url: getFullImageUrl(apiData.image_url),
  sort_order: apiData.sort_order ?? 0,
});

const mapProduct = (apiData: any): Product => {
  const product: Product = {
    id: apiData.id || '',
    name: apiData.name || '',
    description: apiData.description || '',
    price: Number(apiData.price) || 0,
    quantity: Number(apiData.quantity) || 0,
    in_stock: apiData.in_stock === true || (apiData.in_stock === undefined && Number(apiData.quantity) > 0),
    is_active: apiData.is_active === true,
    category_id: apiData.category_id || '',
    images: apiData.images ? apiData.images.map(mapProductImage) : [],
    image_count: apiData.image_count || 0,
  };

  // إذا كانت الصورة موجودة بشكل مسطح من البحث (findAll)
  if (apiData.image_url && (!product.images || product.images.length === 0)) {
    product.images = [{
      id: 'primary',
      product_id: product.id,
      image_url: getFullImageUrl(apiData.image_url),
      sort_order: 0
    }];
    // إذا لم يكن لدينا عدداً صحيحاً للصور، نعتبر أن لدينا واحدة على الأقل
    if (!product.image_count) product.image_count = 1;
  }

  return product;
};

export const productsApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get('/categories');
    const data = response.data.data || response.data;
    const categories = data.categories || data || [];
    return Array.isArray(categories) ? categories.map(mapCategory) : [];
  },

  getProducts: async (params?: { page?: number; limit?: number; categoryId?: string }): Promise<{ products: Product[]; pagination: any }> => {
    const response = await apiClient.get('/products', { params: { page: params?.page || 1, limit: params?.limit || 20 } });
    const data = response.data.data || response.data;
    const products = data.products || data || [];
    return {
      products: Array.isArray(products) ? products.map(mapProduct) : [],
      pagination: data.pagination || { total: 0, page: 1, limit: 20, pages: 0 }
    };
  },

  getProductDetails: async (productId: string): Promise<Product & { images: ProductImage[] }> => {
    const response = await apiClient.get(`/products/${productId}`);
    const data = response.data.data || response.data;
    const product = mapProduct(data.product || data);
    const images = (data.images || []).map(mapProductImage);
    return { ...product, images };
  },
  // إضافة منتج جديد
createProduct: async (data: {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category_id: string;
  is_active?: boolean;
}): Promise<Product> => {
  const response = await apiClient.post('/products', data);
  const result = response.data.data || response.data;
  return mapProduct(result);
},

// تحديث منتج
updateProduct: async (id: string, data: {
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  category_id?: string;
  is_active?: boolean;
}): Promise<Product> => {
  const response = await apiClient.put(`/products/${id}`, data);
  const result = response.data.data || response.data;
  return mapProduct(result);
},

// حذف منتج
deleteProduct: async (id: string): Promise<void> => {
  await apiClient.delete(`/products/${id}`);
},
// إضافة هذه الدوال إلى productsApi

createCategory: async (name: string): Promise<Category> => {
  const response = await apiClient.post('/categories', { name });
  const result = response.data.data || response.data;
  return mapCategory(result);
},

updateCategory: async (id: string, name: string): Promise<Category> => {
  const response = await apiClient.put(`/categories/${id}`, { name });
  const result = response.data.data || response.data;
  return mapCategory(result);
},

deleteCategory: async (id: string): Promise<void> => {
  await apiClient.delete(`/categories/${id}`);
},
// رفع صورة للمنتج
uploadProductImage: async (productId: string, imageFile: FormData): Promise<ProductImage> => {
  const response = await apiClient.post(`/products/${productId}/images`, imageFile, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  const result = response.data.data || response.data;
  return mapProductImage(result);
},

// جلب صور المنتج
getProductImages: async (productId: string): Promise<ProductImage[]> => {
  const response = await apiClient.get(`/products/${productId}/images`);
  const data = response.data.data || response.data;
  const images = data.images || data || [];
  return Array.isArray(images) ? images.map(mapProductImage) : [];
},

// حذف صورة
deleteProductImage: async (imageId: string): Promise<void> => {
  await apiClient.delete(`/product-images/${imageId}`);
},

// تحديث ترتيب الصورة فردياً
updateImageOrder: async (imageId: string, sortOrder: number): Promise<ProductImage> => {
  const response = await apiClient.put(`/product-images/${imageId}/order`, { sort_order: sortOrder });
  const result = response.data.data || response.data;
  return mapProductImage(result);
},

// تحديث الترتيب بالجملة 
reorderImages: async (imageIds: string[]): Promise<void> => {
  await apiClient.put('/product-images/reorder', { imageIds });
},
};