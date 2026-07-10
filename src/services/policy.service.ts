import apiClient from "@/lib/axios";
import API from "@/config/api.endpoints";
import { PolicySlug, PolicyData, CreatePolicyPayload, UpdatePolicyPayload } from "@/types/policy.types";
import { ApiResponse } from "@/types/api.types";

export const policyService = {
  get: async (slug: PolicySlug): Promise<PolicyData | null> => {
    try {
      const res = await apiClient.get<ApiResponse<PolicyData>>(API.policy.get(slug));
      return res.data.data;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) return null;
      throw err;
    }
  },

  create: async (slug: PolicySlug, payload: CreatePolicyPayload): Promise<PolicyData> => {
    const res = await apiClient.post<ApiResponse<PolicyData>>(API.policy.create(slug), payload);
    return res.data.data;
  },

  update: async (slug: PolicySlug, payload: UpdatePolicyPayload): Promise<PolicyData> => {
    const res = await apiClient.patch<ApiResponse<PolicyData>>(API.policy.update(slug), payload);
    return res.data.data;
  },
};
