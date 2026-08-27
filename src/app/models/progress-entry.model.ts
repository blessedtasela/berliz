// Shapes mirror the backend /progress-entry contract (ProgressEntryResponse),
// wrapped in ApiResponse<T> (see models/Api.interface.ts).
import { PhotoResponse } from './Media.interface';

export interface ProgressEntry {
  id: number;
  clientId: number;

  weightKg: number | null;
  bodyFatPercent: number | null;

  photos: PhotoResponse[];

  date: Date;
  lastUpdate: Date;

  message?: string;
}

/** Create/update payload. `photos` is only used on create (already-Strapi-uploaded). */
export interface ProgressEntryRequest {
  id?: number;
  weightKg?: number | null;
  bodyFatPercent?: number | null;
  date?: Date;
  photos?: ProgressEntryPhotoRequest[];
}

/** Matches the backend's PhotoRequest shape for the fields the client actually sends. */
export interface ProgressEntryPhotoRequest {
  strapiId: number;
  photoUrl: string;
  name: string;
  mimeType: string;
  byteSize: number;
}
