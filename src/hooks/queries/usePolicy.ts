import { useQuery } from "@tanstack/react-query";
import { policyService } from "@/services/policy.service";
import { PolicySlug } from "@/types/policy.types";

export function usePolicy(slug: PolicySlug) {
  return useQuery({
    queryKey: ["policy", slug],
    queryFn: () => policyService.get(slug),
    retry: false,
    staleTime: 0,
  });
}
