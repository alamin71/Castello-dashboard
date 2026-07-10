export type PolicySlug = "privacy-policy" | "terms-conditions" | "about-app";

export interface PolicyData {
  _id: string;
  title: string;
  content: string;
  slug: string;
}

export interface CreatePolicyPayload {
  title: string;
  content: string;
}

export interface UpdatePolicyPayload {
  content: string;
}
