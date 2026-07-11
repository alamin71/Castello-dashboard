import apiClient from "@/lib/axios";
import API from "@/config/api.endpoints";
import { ApiResponse } from "@/types/api.types";
import {
  VariantCategory,
  VariantItem,
  CreateVariantCategoryPayload,
  UpdateVariantCategoryPayload,
  CreateVariantItemPayload,
  UpdateVariantItemPayload,
  VariantListParams,
  VariantItemListParams,
} from "@/types/variant.types";

export const variantService = {
  // ── Categories ──────────────────────────────────────────────
  listCategories: async (params: VariantListParams): Promise<VariantCategory[]> => {
    const res = await apiClient.get(API.variants.categories.list, { params });
    const data = res.data?.data;
    if (Array.isArray(data)) return data;
    if (data?.result && Array.isArray(data.result)) return data.result;
    return [];
  },

  createCategory: async (payload: CreateVariantCategoryPayload): Promise<VariantCategory> => {
    const res = await apiClient.post<ApiResponse<VariantCategory>>(
      API.variants.categories.create,
      { name: payload.name }
    );
    return res.data.data;
  },

  updateCategory: async (id: string, payload: UpdateVariantCategoryPayload): Promise<VariantCategory> => {
    const res = await apiClient.patch<ApiResponse<VariantCategory>>(
      API.variants.categories.update(id),
      { ...(payload.name ? { name: payload.name } : {}), ...(payload.status ? { status: payload.status } : {}) }
    );
    return res.data.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(API.variants.categories.delete(id));
  },

  // ── Items ────────────────────────────────────────────────────
  listItems: async (params: VariantItemListParams): Promise<VariantItem[]> => {
    const res = await apiClient.get(API.variants.items.list, { params });
    const data = res.data?.data;
    if (Array.isArray(data)) return data;
    if (data?.result && Array.isArray(data.result)) return data.result;
    return [];
  },

  createItem: async (payload: CreateVariantItemPayload): Promise<VariantItem> => {
    const form = new FormData();
    form.append("name", payload.name);
    form.append("variantCategoryId", payload.variantCategoryId);
    const res = await apiClient.post<ApiResponse<VariantItem>>(
      API.variants.items.create,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data.data;
  },

  updateItem: async (id: string, payload: UpdateVariantItemPayload): Promise<VariantItem> => {
    const form = new FormData();
    if (payload.name) form.append("name", payload.name);
    if (payload.status) form.append("status", payload.status);
    if (payload.variantCategoryId) form.append("variantCategoryId", payload.variantCategoryId);
    const res = await apiClient.patch<ApiResponse<VariantItem>>(
      API.variants.items.update(id),
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data.data;
  },

  deleteItem: async (id: string): Promise<void> => {
    await apiClient.delete(API.variants.items.delete(id));
  },
};
