export interface CategoryItem {
  _id: string;
  categoryId: string;
  name: string;
  image: string;
  status: "active" | "inactive";
  isDeleted: boolean;
  totalProducts?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  image: File;
}

export interface UpdateCategoryPayload {
  name?: string;
  status?: "active" | "inactive";
  image?: File;
}

export interface CategoryListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: "active" | "inactive";
}

export interface CategoryListMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface CategoryListResponse {
  result: CategoryItem[];
  meta: CategoryListMeta;
}
