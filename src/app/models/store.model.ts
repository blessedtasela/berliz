/** Mirrors the backend `StoreResponse`. */
export interface Store {
  id: number;
  partnerId: number;

  name: string;
  motto?: string | null;
  address?: string | null;
  introduction?: string | null;
  location?: string | null;
  photoUrl?: string | null;
  likes: number;

  categoryIds?: number[];
  categoryNames?: string[];

  /** "true" (live) / "false" (deactivated). */
  status: string;
  date: Date;
  lastUpdate: Date;

  message?: string;
}

/** Mirrors the backend `StoreRequest`. */
export interface StoreRequest {
  id?: number;
  name: string;
  motto?: string;
  address?: string;
  introduction?: string;
  location?: string;
  photo?: string;
  categoryIds?: number[];
}
