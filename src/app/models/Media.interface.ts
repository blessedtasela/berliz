import { MediaOwnerType } from "./Media.enum";

export interface PhotoResponse {
  id: number;
  strapiId: number;
  photoUrl: string;
  name: string;
  mimeType: string;
  byteSize: number;
  ownerId: number;
  mediaOwnerType: MediaOwnerType;
    message?: string;
}

export interface VideoResponse {
  id: number;
  strapiId: number;
  videoUrl: string;
  name: string;
  mimeType: string;
  byteSize: number;
  ownerId: number;
  mediaOwnerType: MediaOwnerType;
  message?: string;
}

