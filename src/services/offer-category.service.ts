import apiClient from "@/lib/axios";
import API from "@/config/api.endpoints";
import {
  OfferCategoryItem,
  CreateOfferCategoryPayload,
  UpdateOfferCategoryPayload,
  OfferCategoryListParams,
  OfferCategoryListResponse,
} from "@/types/offer-category.types";

export const offerCategoryService = {
  list: async (params: OfferCategoryListParams): Promise<OfferCategoryListResponse> => {
    const res = await apiClient.get(API.offerCategories.list, { params });
    const data = res.data?.data;
    if (data?.result && Array.isArray(data.result)) return data;
    if (Array.isArray(data))
      return { result: data, meta: { page: 1, limit: data.length, total: data.length, totalPage: 1 } };
    return { result: [], meta: { page: 1, limit: 20, total: 0, totalPage: 1 } };
  },

  create: async (payload: CreateOfferCategoryPayload): Promise<OfferCategoryItem> => {
    const form = new FormData();
    form.append("name", payload.name);
    form.append("image", payload.image);
    const res = await apiClient.post(API.offerCategories.create, form);
    return res.data.data;
  },

  update: async (id: string, payload: UpdateOfferCategoryPayload): Promise<OfferCategoryItem> => {
    const form = new FormData();
    if (payload.name) form.append("name", payload.name);
    if (payload.image) form.append("image", payload.image);
    if (payload.status) form.append("status", payload.status);
    const res = await apiClient.patch(API.offerCategories.update(id), form);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API.offerCategories.delete(id));
  },

  reorder: async (orderedIds: string[]): Promise<void> => {
    await apiClient.patch(API.offerCategories.reorder, { orderedIds });
  },
};
