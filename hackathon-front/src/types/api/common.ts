// Backend response envelopes — mirrors com.edumetric.backend.common.api

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  details: string[] | null;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
}
