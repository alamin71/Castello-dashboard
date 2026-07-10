import apiClient from "@/lib/axios";
import API from "@/config/api.endpoints";
import { ApiResponse } from "@/types/api.types";
import {
  CategoryItem,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategoryListParams,
} from "@/types/category.types";

export const categoryService = {
  list: async (params: CategoryListParams): Promise<CategoryItem[]> => {
    const res = await apiClient.get<ApiResponse<CategoryItem[]>>(
      API.categories.list,
      { params }
    );
    return res.data.data;
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
