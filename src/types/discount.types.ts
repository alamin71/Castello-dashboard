export interface DiscountProductEntry {
  productId: string | { _id: string; name: string };
  variantItemIds: (string | { _id: string; name: string })[];
}

export interface DiscountItem {
  _id: string;
  discountId?: string;
  name: string;
  discountMethod: "percent" | "amount";
  discountValue: number;
  startDate: string;
  expireDate: string;
  applicableForAll: boolean;
  products?: DiscountProductEntry[];
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscountPayload {
  name: string;
  discountMethod: "percent" | "amount";
  discountValue: number;
  startDate: string;
  expireDate: string;
  applicableForAll: boolean;
  products?: { productId: string; variantItemIds: string[] }[];
}

export interface UpdateDiscountPayload {
  name?: string;
  discountMethod?: "percent" | "amount";
  discountValue?: number;
  startDate?: string;
  expireDate?: string;
  applicableForAll?: boolean;
  products?: { productId: string; variantItemIds: string[] }[];
  status?: "active" | "inactive";
}

export interface DiscountListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: "active" | "inactive";
}

export interface DiscountListMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface DiscountListResponse {
  result: DiscountItem[];
  meta: DiscountListMeta;
}
