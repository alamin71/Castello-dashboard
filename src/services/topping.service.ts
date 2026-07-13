import apiClient from "@/lib/axios";
import API from "@/config/api.endpoints";
import {
  ToppingCategory,
  ToppingItem,
  CreateToppingCategoryPayload,
  UpdateToppingCategoryPayload,
  CreateToppingItemPayload,
  UpdateToppingItemPayload,
  ToppingListParams,
  ToppingItemListParams,
  ToppingCategoryListResponse,
  ToppingItemListResponse,
} from "@/types/topping.types";

export const toppingService = {
  // ── Categories ──────────────────────────────────────────────
  listCategories: async (params: ToppingListParams): Promise<ToppingCategoryListResponse> => {
    const res = await apiClient.get(API.toppings.categories.list, { params });
    const data = res.data?.data;
    if (data?.result && Array.isArray(data.result)) return data;
    if (Array.isArray(data)) return { result: data, meta: { page: 1, limit: data.length, total: data.length, totalPage: 1 } };
    return { result: [], meta: { page: 1, limit: 10, total: 0, totalPage: 1 } };
  },

  createCategory: async (payload: CreateToppingCategoryPayload): Promise<ToppingCategory> => {
    const form = new FormData();
    form.append("name", payload.name);
    const res = await apiClient.post(API.toppings.categories.create, form);
    return res.data.data;
  },

  updateCategory: async (id: string, payload: UpdateToppingCategoryPayload): Promise<ToppingCategory> => {
    const form = new FormData();
    if (payload.name) form.append("name", payload.name);
    if (payload.status) form.append("status", payload.status);
    const res = await apiClient.patch(API.toppings.categories.update(id), form);
    return res.data.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(API.toppings.categories.delete(id));
  },

  // ── Items ────────────────────────────────────────────────────
  listItems: async (params: ToppingItemListParams): Promise<ToppingItemListResponse> => {
    const res = await apiClient.get(API.toppings.items.list, { params });
    const data = res.data?.data;
    if (data?.result && Array.isArray(data.result)) return data;
    if (Array.isArray(data)) return { result: data, meta: { page: 1, limit: data.length, total: data.length, totalPage: 1 } };
    return { result: [], meta: { page: 1, limit: 10, total: 0, totalPage: 1 } };
  },

  createItem: async (payload: CreateToppingItemPayload): Promise<ToppingItem> => {
    const form = new FormData();
    form.append("name", payload.name);
    form.append("toppingCategoryId", payload.toppingCategoryId);
    form.append("price", String(payload.price));
    const res = await apiClient.post(API.toppings.items.create, form);
    return res.data.data;
  },

  updateItem: async (id: string, payload: UpdateToppingItemPayload): Promise<ToppingItem> => {
    const form = new FormData();
    if (payload.name) form.append("name", payload.name);
    if (payload.status) form.append("status", payload.status);
    if (payload.toppingCategoryId) form.append("toppingCategoryId", payload.toppingCategoryId);
    if (payload.price !== undefined) form.append("price", String(payload.price));
    const res = await apiClient.patch(API.toppings.items.update(id), form);
    return res.data.data;
  },

  deleteItem: async (id: string): Promise<void> => {
    await apiClient.delete(API.toppings.items.delete(id));
  },
};
