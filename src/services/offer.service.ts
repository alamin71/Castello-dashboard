import apiClient from "@/lib/axios";
import API from "@/config/api.endpoints";
import {
  OfferItem,
  CreateOfferPayload,
  UpdateOfferPayload,
  OfferListParams,
  OfferListResponse,
} from "@/types/offer.types";

export const offerService = {
  list: async (params: OfferListParams): Promise<OfferListResponse> => {
    const res = await apiClient.get(API.offers.list, { params });
    const data = res.data?.data;
    if (data?.result && Array.isArray(data.result)) return data;
    if (Array.isArray(data))
      return { result: data, meta: { page: 1, limit: data.length, total: data.length, totalPage: 1 } };
    return { result: [], meta: { page: 1, limit: 20, total: 0, totalPage: 1 } };
  },

  create: async (payload: CreateOfferPayload): Promise<OfferItem> => {
    const form = new FormData();
    form.append("title", payload.title);
    if (payload.description) form.append("description", payload.description);
    form.append("price", String(payload.price));
    if (payload.offerCategoryId) form.append("offerCategoryId", payload.offerCategoryId);
    form.append("offerItems", JSON.stringify(payload.offerItems));
    form.append("availability", JSON.stringify(payload.availability));
    form.append("availableFor", JSON.stringify(payload.availableFor));
    form.append("mainImage", payload.mainImage);
    if (payload.gallery) payload.gallery.forEach((f) => form.append("gallery", f));
    const res = await apiClient.post(API.offers.create, form);
    return res.data.data;
  },

  update: async (id: string, payload: UpdateOfferPayload): Promise<OfferItem> => {
    const form = new FormData();
    if (payload.title) form.append("title", payload.title);
    if (payload.description !== undefined) form.append("description", payload.description);
    if (payload.price !== undefined) form.append("price", String(payload.price));
    if (payload.status) form.append("status", payload.status);
    if (payload.offerCategoryId) form.append("offerCategoryId", payload.offerCategoryId);
    if (payload.offerItems) form.append("offerItems", JSON.stringify(payload.offerItems));
    if (payload.availability) form.append("availability", JSON.stringify(payload.availability));
    if (payload.availableFor) form.append("availableFor", JSON.stringify(payload.availableFor));
    if (payload.mainImage) form.append("mainImage", payload.mainImage);
    if (payload.gallery) payload.gallery.forEach((f) => form.append("gallery", f));
    if (payload.removeGallery && payload.removeGallery.length > 0)
      payload.removeGallery.forEach((url) => form.append("removeGallery[]", url));
    const res = await apiClient.patch(API.offers.update(id), form);
    return res.data.data;
  },

  getById: async (id: string): Promise<OfferItem> => {
    const res = await apiClient.get(API.offers.getById(id));
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API.offers.delete(id));
  },
};
