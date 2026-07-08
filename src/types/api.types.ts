// Generic API response wrappers — matches backend shape exactly

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
