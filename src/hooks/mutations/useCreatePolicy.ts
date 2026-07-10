import { useMutation, useQueryClient } from "@tanstack/react-query";
import { policyService } from "@/services/policy.service";
import { PolicySlug, CreatePolicyPayload } from "@/types/policy.types";

export function useCreatePolicy(slug: PolicySlug) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePolicyPayload) => policyService.create(slug, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["policy", slug], data);
    },
  });
}
