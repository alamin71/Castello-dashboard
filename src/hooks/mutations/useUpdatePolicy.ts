import { useMutation, useQueryClient } from "@tanstack/react-query";
import { policyService } from "@/services/policy.service";
import { PolicySlug, UpdatePolicyPayload } from "@/types/policy.types";

export function useUpdatePolicy(slug: PolicySlug) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePolicyPayload) => policyService.update(slug, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["policy", slug], data);
    },
  });
}
