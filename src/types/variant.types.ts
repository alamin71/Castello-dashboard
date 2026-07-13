export interface VariantCategory {
  _id: string;
  variantCategoryId: string;
  name: string;
  image?: string;
  status: "active" | "inactive";
  isDeleted: boolean;
  totalItems?: number;
  createdAt: string;
  updatedAt: string;
}

export interface VariantItem {
  _id: string;
  variantItemId: string;
  name: string;
  variantCategoryId: string | { _id: string; name: string };
  variantCategory?: { _id: string; name: string };
  status: "active" | "inactive";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVariantCategoryPayload {
  name: string;
  image?: File;
}

export interface UpdateVariantCategoryPayload {
  name?: string;
  status?: "active" | "inactive";
  image?: File;
}

export interface CreateVariantItemPayload {
  name: string;
  variantCategoryId: string;
}

export interface UpdateVariantItemPayload {
  name?: string;
  status?: "active" | "inactive";
  variantCategoryId?: string;
}

export interface VariantListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: "active" | "inactive";
}

export interface VariantItemListParams extends VariantListParams {
  variantCategoryId?: string;
}

export interface VariantListMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface VariantCategoryListResponse {
  result: VariantCategory[];
  meta: VariantListMeta;
}

export interface VariantItemListResponse {
  result: VariantItem[];
  meta: VariantListMeta;
}
