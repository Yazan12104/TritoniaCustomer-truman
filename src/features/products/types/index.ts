export interface Category {
  id: string;
  name: string;
  // isActive محذوف - غير موجود في Backend
}

export interface ProductImage {
  id: string;
  product_id: string;      // snake_case
  image_url: string;       // snake_case
  sort_order: number;      // بدلاً من displayOrder
  // isPrimary محذوف - يتم تحديده عن طريق sort_order === 0
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  in_stock: boolean;
  is_active: boolean;
  category_id: string;     // snake_case بدلاً من categoryId
  images?: ProductImage[];
  image_count?: number;
  // commissionType, commissionValue, costPrice محذوفة - غير موجودة في Backend
}