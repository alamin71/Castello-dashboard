export interface CouponProductEntry {
  productId: string | { _id: string; name: string };
  variantItemIds: (string | { _id: string; name: string })[];
}

export interface CouponItem {
  _id: string;
  couponId?: string;
  name: string;
  code: string;
  discountMethod: "percent" | "amount";
  discountValue: number;
  minimumOrder: number;
  startDate: string;
  expireDate: string;
  applicableForAll: boolean;
  products?: CouponProductEntry[];
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponPayload {
  name: string;
  code: string;
  discountMethod: "percent" | "amount";
  discountValue: number;
  minimumOrder: number;
  startDate: string;
  expireDate: string;
  applicableForAll: boolean;
  products?: { productId: string; variantItemIds: string[] }[];
}

export interface UpdateCouponPayload {
  name?: string;
  code?: string;
  discountMethod?: "percent" | "amount";
  discountValue?: number;
  minimumOrder?: number;
  startDate?: string;
  expireDate?: string;
  applicableForAll?: boolean;
  products?: { productId: string; variantItemIds: string[] }[];
  status?: "active" | "inactive";
}

export interface CouponListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: "active" | "inactive";
}

export interface CouponListMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface CouponListResponse {
  result: CouponItem[];
  meta: CouponListMeta;
}
