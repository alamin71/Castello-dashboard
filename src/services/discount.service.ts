import apiClient from "@/lib/axios";
import API from "@/config/api.endpoints";
import {
  DiscountItem,
  CreateDiscountPayload,
  UpdateDiscountPayload,
  DiscountListParams,
  DiscountListResponse,
} from "@/types/discount.types";

export const discountService = {
  list: async (params: DiscountListParams): Promise<DiscountListResponse> => {
    const res = await apiClient.get(API.discounts.list, { params });
    const data = res.data?.data;
    if (data?.result && Array.isArray(data.result)) return data;
    if (Array.isArray(data))
      return { result: data, meta: { page: 1, limit: data.length, total: data.length, totalPage: 1 } };
    return { result: [], meta: { page: 1, limit: 20, total: 0, totalPage: 1 } };
  },

  create: async (payload: CreateDiscountPayload): Promise<DiscountItem> => {
    const res = await apiClient.post(API.discounts.create, payload);
    return res.data.data;
  },

  update: async (id: string, payload: UpdateDiscountPayload): Promise<DiscountItem> => {
    const res = await apiClient.patch(API.discounts.update(id), payload);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API.discounts.delete(id));
  },
};
