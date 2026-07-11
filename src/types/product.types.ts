export interface ProductVariantEntry {
  variantCategoryId: string | { _id: string; name: string };
  variantItemId: string | { _id: string; name: string };
  price: number;
  status: "active" | "inactive";
}

export interface ProductItem {
  _id: string;
  productId: string;
  name: string;
  description?: string;
  categoryId: string | { _id: string; name: string };
  type: "single" | "variant";
  price?: number;
  toppingCategoryIds: (string | { _id: string; name: string })[];
  defaultToppingItemIds: (string | { _id: string; name: string })[];
  availability: { website: boolean; pos: boolean; kiosk: boolean };
  mainImage?: string;
  gallery?: string[];
  variants: ProductVariantEntry[];
  status: "active" | "inactive";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductVariant {
  variantCategoryId: string;
  variantItemId: string;
  price: number;
  status: "active" | "inactive";
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  categoryId: string;
  type: "single" | "variant";
  price?: number;
  toppingCategoryIds?: string[];
  defaultToppingItemIds?: string[];
  availability: { website: boolean; pos: boolean; kiosk: boolean };
  mainImage?: File;
  gallery?: File[];
  variants?: CreateProductVariant[];
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  status?: "active" | "inactive";
  availability?: { website: boolean; pos: boolean; kiosk: boolean };
  mainImage?: File;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: "active" | "inactive";
  categoryId?: string;
  type?: "single" | "variant";
}

export interface ProductMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface ProductListResponse {
  result: ProductItem[];
  meta: ProductMeta;
}
