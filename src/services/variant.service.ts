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
  VariantCategoryListResponse,
  VariantItemListResponse,
} from "@/types/variant.types";

export const variantService = {
  // ── Categories ──────────────────────────────────────────────
  listCategories: async (params: VariantListParams): Promise<VariantCategoryListResponse> => {
    const res = await apiClient.get(API.variants.categories.list, { params });
    const data = res.data?.data;
    if (data?.result && Array.isArray(data.result)) return data;
    if (Array.isArray(data)) return { result: data, meta: { page: 1, limit: data.length, total: data.length, totalPage: 1 } };
    return { result: [], meta: { page: 1, limit: 10, total: 0, totalPage: 1 } };
  },

  createCategory: async (payload: CreateVariantCategoryPayload): Promise<VariantCategory> => {
    const form = new FormData();
    form.append("name", payload.name);
    const res = await apiClient.post<ApiResponse<VariantCategory>>(
      API.variants.categories.create,
      form
    );
    return res.data.data;
  },

  updateCategory: async (id: string, payload: UpdateVariantCategoryPayload): Promise<VariantCategory> => {
    const form = new FormData();
    if (payload.name) form.append("name", payload.name);
    if (payload.status) form.append("status", payload.status);
    const res = await apiClient.patch<ApiResponse<VariantCategory>>(
      API.variants.categories.update(id),
      form
    );
    return res.data.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(API.variants.categories.delete(id));
  },

  // ── Items ────────────────────────────────────────────────────
  listItems: async (params: VariantItemListParams): Promise<VariantItemListResponse> => {
    const res = await apiClient.get(API.variants.items.list, { params });
    const data = res.data?.data;
    if (data?.result && Array.isArray(data.result)) return data;
    if (Array.isArray(data)) return { result: data, meta: { page: 1, limit: data.length, total: data.length, totalPage: 1 } };
    return { result: [], meta: { page: 1, limit: 10, total: 0, totalPage: 1 } };
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
