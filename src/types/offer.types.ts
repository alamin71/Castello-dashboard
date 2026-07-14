// Shapes returned by the API — IDs may be populated objects
export interface OfferProductResponse {
  productId: string | { _id: string; name: string };
  variantItemIds: (string | { _id: string; name: string })[];
}

export interface OfferItemResponse {
  categoryId: string | { _id: string; name: string };
  isFixed: boolean;
  products: OfferProductResponse[];
}

// Shapes we send to the API — always plain strings
export interface OfferProductRequest {
  productId: string;
  variantItemIds: string[];
}

export interface OfferItemRequest {
  categoryId: string;
  isFixed: boolean;
  products: OfferProductRequest[];
}

export interface OfferItem {
  _id: string;
  offerId: string;
  title: string;
  description?: string;
  price: number;
  mainImage: string;
  gallery: string[];
  offerItems: OfferItemResponse[];
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
  offerItems: OfferItemRequest[];
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
  offerItems?: OfferItemRequest[];
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
  availability?: "website" | "pos" | "kiosk";
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
