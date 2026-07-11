import apiClient from "@/lib/axios";
import API from "@/config/api.endpoints";
import {
  ProductItem,
  CreateProductPayload,
  UpdateProductPayload,
  ProductListParams,
  ProductListResponse,
} from "@/types/product.types";

export const productService = {
  list: async (params: ProductListParams): Promise<ProductListResponse> => {
    const res = await apiClient.get(API.products.list, { params });
    const data = res.data?.data;
    if (data?.result && Array.isArray(data.result)) return data;
    if (Array.isArray(data))
      return { result: data, meta: { page: 1, limit: data.length, total: data.length, totalPage: 1 } };
    return { result: [], meta: { page: 1, limit: 20, total: 0, totalPage: 1 } };
  },

  create: async (payload: CreateProductPayload): Promise<ProductItem> => {
    const form = new FormData();
    form.append("name", payload.name);
    if (payload.description) form.append("description", payload.description);
    form.append("categoryId", payload.categoryId);
    form.append("type", payload.type);

    if (payload.type === "single" && payload.price !== undefined) {
      form.append("price", String(payload.price));
    }

    if (payload.toppingCategoryIds && payload.toppingCategoryIds.length > 0) {
      payload.toppingCategoryIds.forEach((id) => form.append("toppingCategoryIds", id));
    } else {
      form.append("toppingCategoryIds", "[]");
    }

    if (payload.defaultToppingItemIds && payload.defaultToppingItemIds.length > 0) {
      payload.defaultToppingItemIds.forEach((id) => form.append("defaultToppingItemIds", id));
    } else {
      form.append("defaultToppingItemIds", "[]");
    }

    form.append("availability", JSON.stringify(payload.availability));

    if (payload.mainImage) form.append("mainImage", payload.mainImage);
    if (payload.gallery) payload.gallery.forEach((f) => form.append("gallery", f));

    if (payload.type === "variant" && payload.variants) {
      payload.variants.forEach((v, i) => {
        form.append(`variants[${i}][variantCategoryId]`, v.variantCategoryId);
        form.append(`variants[${i}][variantItemId]`, v.variantItemId);
        form.append(`variants[${i}][price]`, String(v.price));
        form.append(`variants[${i}][status]`, v.status);
      });
    }

    const res = await apiClient.post(API.products.create, form);
    return res.data.data;
  },

  update: async (id: string, payload: UpdateProductPayload): Promise<ProductItem> => {
    const form = new FormData();
    if (payload.name) form.append("name", payload.name);
    if (payload.description !== undefined) form.append("description", payload.description);
    if (payload.status) form.append("status", payload.status);
    if (payload.availability) form.append("availability", JSON.stringify(payload.availability));
    if (payload.mainImage) form.append("mainImage", payload.mainImage);
    const res = await apiClient.patch(API.products.update(id), form);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API.products.delete(id));
  },
};
