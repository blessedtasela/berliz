export interface StrapiUploadResponse {
  id: number;
  name: string;
  url: string;
  mime: string;
  size: number;
}

export interface StrapiUploadResult {
  id: number;
  url: string;
  fullUrl: string;
}

export interface ApiResponse {
  message: string;
}

