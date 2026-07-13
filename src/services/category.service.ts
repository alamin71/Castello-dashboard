import apiClient from "@/lib/axios";
import API from "@/config/api.endpoints";
import { ApiResponse } from "@/types/api.types";
import {
  CategoryItem,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategoryListParams,
  CategoryListResponse,
} from "@/types/category.types";

export const categoryService = {
  list: async (params: CategoryListParams): Promise<CategoryListResponse> => {
    const res = await apiClient.get(API.categories.list, { params });
    const data = res.data?.data;
    if (data?.result && Array.isArray(data.result)) return data;
    if (Array.isArray(data))
      return { result: data, meta: { page: 1, limit: data.length, total: data.length, totalPage: 1 } };
    return { result: [], meta: { page: 1, limit: 10, total: 0, totalPage: 1 } };
  },

  create: async (payload: CreateCategoryPayload): Promise<CategoryItem> => {
    const form = new FormData();
    form.append("name", payload.name);
    form.append("image", payload.image);
    const res = await apiClient.post<ApiResponse<CategoryItem>>(
      API.categories.create,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data.data;
  },

  update: async (id: string, payload: UpdateCategoryPayload): Promise<CategoryItem> => {
    const form = new FormData();
    if (payload.name)   form.append("name", payload.name);
    if (payload.status) form.append("status", payload.status);
    if (payload.image)  form.append("image", payload.image);
    const res = await apiClient.patch<ApiResponse<CategoryItem>>(
      API.categories.update(id),
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API.categories.delete(id));
  },

  reorder: async (orderedIds: string[]): Promise<void> => {
    await apiClient.patch(API.categories.reorder, { orderedIds });
  },
};
