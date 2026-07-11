export interface ToppingCategory {
  _id: string;
  toppingCategoryId: string;
  name: string;
  status: "active" | "inactive";
  isDeleted: boolean;
  totalItems?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ToppingItem {
  _id: string;
  toppingItemId: string;
  name: string;
  price: number;
  toppingCategoryId: string | { _id: string; name: string };
  toppingCategory?: { _id: string; name: string };
  status: "active" | "inactive";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateToppingCategoryPayload {
  name: string;
}

export interface UpdateToppingCategoryPayload {
  name?: string;
  status?: "active" | "inactive";
}

export interface CreateToppingItemPayload {
  name: string;
  toppingCategoryId: string;
  price: number;
}

export interface UpdateToppingItemPayload {
  name?: string;
  status?: "active" | "inactive";
  toppingCategoryId?: string;
  price?: number;
}

export interface ToppingListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: "active" | "inactive";
}

export interface ToppingItemListParams extends ToppingListParams {
  toppingCategoryId?: string;
}
