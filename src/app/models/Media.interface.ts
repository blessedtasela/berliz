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
  date: Date;
  lastUpdate: Date;
}

export interface VideoResponse {
  id: number;
  strapiId: number;
  publicId: string;
  videoUrl: string;
  secureUrl: string;
  playbackUrl: string;
  name: string;
  mimeType: string;
  format: string;
  byteSize: number;
  duration: number;
  mediaOwnerType: MediaOwnerType;
  ownerId: number;
  date: Date;
  lastUpdate: Date;
}

