export interface StrapiUploadResponse {
  id: number;
  name: string;
  url: string;
  /** Absolute URL (resolveStrapiUrl(url)) -- what the browser can actually load; `url` alone may be host-relative. */
  fullUrl: string;
  mime: string;
  size: number;
}

export interface StrapiUploadResult {
  id: number;
  url: string;
  fullUrl: string;
}

