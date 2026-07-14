export interface OfferProductEntry {
  productId: string | { _id: string; name: string };
  variantItemIds: (string | { _id: string; name: string })[];
}

export interface OfferItemPayload {
  categoryId: string | { _id: string; name: string };
  isFixed: boolean;
  products: OfferProductEntry[];
}

export interface OfferItem {
  _id: string;
  offerId: string;
  title: string;
  description?: string;
  price: number;
  mainImage: string;
  gallery: string[];
  offerItems: OfferItemPayload[];
  totalItems: number;
  availability: { website: boolean; pos: boolean; kiosk: boolean };
  availableFor: { homeDelivery: boolean; takeaway: boolean };
  status: "active" | "inactive";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferPayload {
  title: string;
  description?: string;
  price: number;
  offerItems: OfferItemPayload[];
  availability: { website: boolean; pos: boolean; kiosk: boolean };
  availableFor: { homeDelivery: boolean; takeaway: boolean };
  mainImage: File;
  gallery?: File[];
}

export interface UpdateOfferPayload {
  title?: string;
  description?: string;
  price?: number;
  status?: "active" | "inactive";
  offerItems?: OfferItemPayload[];
  availability?: { website: boolean; pos: boolean; kiosk: boolean };
  availableFor?: { homeDelivery: boolean; takeaway: boolean };
  mainImage?: File;
  gallery?: File[];
  removeGallery?: string[];
}

export interface OfferListParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: "active" | "inactive";
}

export interface OfferListMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface OfferListResponse {
  result: OfferItem[];
  meta: OfferListMeta;
}
