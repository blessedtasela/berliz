// trainers.interface.ts

import { Categories } from "./categories.interface";
import { Clients } from "./clients.interface";
import { MediaOwnerType } from "./Media.enum";
import { PhotoResponse, VideoResponse } from "./Media.interface";



export interface Trainers {
  id: number;
  name: string;
  motto: string;
  /** @deprecated Internal-use free text only — the public profile shows `locations` instead. */
  address: string;
  experience: string;
  /** The trainer's own per-hour session rate; null/absent when they haven't set one (then sessions aren't priced in-app). */
  hourlyRate?: number | null;
  /** Free-cancellation window in hours (a client cancelling at least this far ahead is refunded in full); null = platform default (24). */
  freeCancelHours?: number | null;
  /** Share (0-100) refunded when a client cancels inside that window; null = platform default (50). */
  lateCancelRefundPercent?: number | null;
  activationUniqueId: string;
  activatedUniqueIdUsed: boolean;
  likes: number;
  status: string;
  date: Date;
  lastUpdate: Date;
  partnerId: number;
  userId: number;
  userFirstname: string;
  userLastname: string;
  userEmail: string;
  categories: Categories[];
  photoResponse: PhotoResponse;
  /** How this trainer coaches — drives the "Available in" section on the public profile. */
  serviceMode?: 'IN_PERSON' | 'HYBRID' | 'ONLINE';
  /** Cities/countries this trainer is available in. Public-facing replacement for `address`. */
  locations?: TrainerLocation[];
  /** Whether a client may name their own training location when booking. */
  customLocationAllowed?: boolean;
  /** Surcharge for a client-chosen custom location; null/0 means none. */
  customLocationFee?: number | null;
  /** Approved public reviews (filled on the public list). */
  reviewCount?: number;
  /** True when this trainer currently holds the platform's top paid subscription tier -- a "Featured" badge perk. */
  featured?: boolean;
  message?: string;
}

export interface TrainerLocation {
  id?: number;
  country: string;
  stateProvince?: string | null;
  city: string;
  /** Optional specific place within the city, e.g. a gym name or address. */
  venue?: string | null;
  /** Optional surcharge for training here; null/0 means none. */
  fee?: number | null;
}

export interface UpdateTrainerPhotoRequest {
  id: number;
  photoRequest: PhotoResponse;
}

export interface TrainerPricing {
  id: number;
  trainerId: number;
  trainerName: string;
  priceOnline: string;
  priceHybrid: string;
  pricePersonal: string;
  discount3Months: string;
  discount6Months: string;
  discount9Months: string;
  discount12Months: string;
  discount2Programs: string;
  date: Date;
  lastUpdate: Date;
  message?: string;
}

export interface TrainerBenefits {
  id: number;
  trainerId: number;
  trainerName: string;
  benefits: string[];
  date: Date;
  lastUpdate: Date;
}

export interface TrainerIntroduction {
  id: number;
  trainerId: number;
  trainerName: string;
  introduction: string;
  photo: PhotoResponse;
  date: Date;
  lastUpdate: Date;

  message?: string;
}

export interface TrainerPhotoAlbum {
  id: number;
  trainerId: number;
  trainerName: string;
  comment: string;
  photos: PhotoResponse[];
  date: Date;
  lastUpdate: Date;
  message: string;
}

export interface TrainerVideoAlbum {
  id: number;
  trainerId: number;
  trainerName: string;
  comment: string;
  videos: VideoResponse[];
  date: Date;
  lastUpdate: Date;
}

export interface TrainerFeatureVideo {
  id: number;
  title: string;
  motivation: string;
  thumbnailUrl: string;
  position: number;
  featured: boolean;
  views: number;
  likes: number;
  status: string;
  date: Date;
  lastUpdate: Date;
  message: string;
  video: VideoResponse;
  trainerId: number;
  trainerName: string;
}

export interface TrainerReview {
  id: number;
  trainerId: number;
  trainerName: string;
  clientId: number;
  clientName: string;
  review: string;
  likes: number;
  status: string;
  photoFrontBefore: PhotoResponse;
  photoFrontAfter: PhotoResponse;
  photoSideBefore: PhotoResponse;
  photoSideAfter: PhotoResponse;
  photoBackBefore: PhotoResponse;
  photoBackAfter: PhotoResponse;
  date: Date;
  lastUpdate: Date;
}

export interface TrainerReviewLikes {
  id: number;
  userId: number;
  userName: string;
  date: Date;
}

export interface TrainerLikes {
  id: number;
  trainerId: number;
  trainerName: string;
  trainerPhoto: PhotoResponse | null;
  userId: number;
  username: string;
  userEmail: string;
  date: Date;
}

export interface TrainerStatistics {
  id: number;
  trainerId: number;
  clients: number;
  experience: number;
  clientCounter: number;
  experienceCounter: number;
  date: string;
}

export interface TrainerHeroAlbum {
  id: number;
  trainerId: number;
  name: string;
  photos: {
    photo: string;
    comment: string;
  }[];
  date: string;
}

export interface TrainerCategory {
  id: number;
  trainerId: number;
  categories: {
    categoryId: number;
    categoryName: string;
    description: string;
    iconUrl: string;
    tags: string[];
    likes: number;
  }[];
  date: string;
}

export interface TrainerSubscription {

  id: number;
  trainerId: number;
  trainerName: string;
  durationTier: string; // MONTH_TO_MONTH | QUARTERLY | etc.
  startDate: Date;
  endDate: Date;
  date: Date;
  lastUpdate: Date;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  status: string; // ACTIVE | PENDING | EXPIRED | CANCELLED
  autoRenew: boolean;
  activatedByAdminId?: number;
  notes?: string;
  cancellationReason?: string;
}

export interface TrainerSubscriptionForm {
  id: number;
  trainerId: number;
  whatsapp: string;
  name: string;
}

export interface TrainerClients {
  id: number;
  userId: number;
  firstname: string;
  lastname: string;
  email: string;
  height: number;
  weight: number;
  bodyFat: number;
  targetWeight: number;
  motivation: string;
  mode: string;
  status: string;
  date: Date;
  lastUpdate: Date;
}

export interface TrainerTestimonials {
  id: number;
  testimonial: string;
  status: string;
  date: Date;
  lastUpdate: Date;
  trainerId: number;
  trainerName: string;
  trainerEmail: string;
  trainerPhotoUrl: string;
  clientId: number;
  clientName: string;
  clientPhotoUrl: string;
  expanded?: boolean;
}