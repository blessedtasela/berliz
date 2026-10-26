/** "new" or "used" -- the only two values the backend accepts. */
export type ProductClassify = 'new' | 'used';

/** Mirrors the backend `ProductResponse`. */
export interface Product {
  id: number;
  uuid?: string | null;

  storeId: number;
  storeName?: string | null;
  storePhotoUrl?: string | null;

  name: string;
  description?: string | null;
  classify: ProductClassify;
  price: number;
  quantity?: number | null;
  photoUrl?: string | null;

  brandId?: number | null;
  brandName?: string | null;

  categoryIds?: number[];
  categoryNames?: string[];
  tagIds?: number[];
  tagNames?: string[];

  likes: number;
  /** "true" (live/for sale) / "false" (deactivated). */
  status: string;
  date: Date;
  lastUpdate: Date;

  message?: string;
}

/** Mirrors the backend `ProductRequest`. */
export interface ProductRequest {
  id?: number;
  name: string;
  description?: string;
  classify: ProductClassify;
  price: number;
  quantity?: number;
  photo?: string;
  /** Free text -- resolved/created server-side so a seller never has to know Brand is curated taxonomy. */
  brandName?: string;
  categoryIds?: number[];
  tagIds?: number[];
}
