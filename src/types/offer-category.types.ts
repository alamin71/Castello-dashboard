export interface OfferCategoryItem {
  _id: string;
  offerCategoryId: string;
  name: string;
  image: string;
  status: "active" | "inactive";
  isDeleted: boolean;
  sortOrder: number;
  assignedOffers: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferCategoryPayload {
  name: string;
  image: File;
}

export interface UpdateOfferCategoryPayload {
  name?: string;
  image?: File;
  status?: "active" | "inactive";
}

export interface OfferCategoryListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: "active" | "inactive";
}

export interface OfferCategoryListMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface OfferCategoryListResponse {
  result: OfferCategoryItem[];
  meta: OfferCategoryListMeta;
}
