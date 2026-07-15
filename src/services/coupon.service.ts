import apiClient from "@/lib/axios";
import API from "@/config/api.endpoints";
import {
  CouponItem,
  CreateCouponPayload,
  UpdateCouponPayload,
  CouponListParams,
  CouponListResponse,
} from "@/types/coupon.types";

export const couponService = {
  list: async (params: CouponListParams): Promise<CouponListResponse> => {
    const res = await apiClient.get(API.coupons.list, { params });
    const data = res.data?.data;
    if (data?.result && Array.isArray(data.result)) return data;
    if (Array.isArray(data))
      return { result: data, meta: { page: 1, limit: data.length, total: data.length, totalPage: 1 } };
    return { result: [], meta: { page: 1, limit: 20, total: 0, totalPage: 1 } };
  },

  create: async (payload: CreateCouponPayload): Promise<CouponItem> => {
    const res = await apiClient.post(API.coupons.create, payload);
    return res.data.data;
  },

  update: async (id: string, payload: UpdateCouponPayload): Promise<CouponItem> => {
    const res = await apiClient.patch(API.coupons.update(id), payload);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API.coupons.delete(id));
  },
};
