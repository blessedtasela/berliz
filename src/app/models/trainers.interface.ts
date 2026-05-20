// trainers.interface.ts

import { Categories } from "./categories.interface";
import { Clients } from "./clients.interface";
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
}

export interface VideoResponse {
  id: number;
  strapiId: string;
  videoUrl: string;
  name: string;
  mimeType: string;
  byteSize: number;
  ownerId: number;
  mediaOwnerType: MediaOwnerType;
}

export interface Trainers {
  id: number;
  name: string;
  motto: string;
  address: string;
  experience: string;
  likes: number;
  status: string;
  date: Date;
  lastUpdate: Date;
  photoResponse: PhotoResponse;
  partnerId: number;
  userId: number;
  userFirstname: string;
  userLastname: string;
  userEmail: string;
  categories: Categories[];
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
  photoResponse: PhotoResponse;
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
}

export interface TrainerVideoAlbum {
  id: number;
  trainerId: number;
  trainerName: string;
  comment: string;
  videoResponses: VideoResponse[];
  date: Date;
  lastUpdate: Date;
}

export interface TrainerFeatureVideo {
  id: number;
  trainerId: number;
  trainerName: string;
  motivation: string;
  video: VideoResponse;
  date: Date;
  lastUpdate: Date;
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

export interface TrainerReviewLike {
  id: number;
  userId: number;
  userName: string;
  date: Date;
}

export interface TrainerLike {
  id: number;
  trainerId: number;
  trainerName: string;
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
  plan: string;
  mode: string;
  date: Date;
  lastUpdate: Date;
}

export interface TrainerSubscriptionForm {
  id: number;
  trainerId: number;
  whatsapp: string;
  name: string;
}

export interface TrainerClients {
  id: number;
  clients?: Clients[];
  trainer?: Trainers;
}

export interface TrainerTestimonials {
  id: number;
  testimonial: string;
  date: Date;
  lastUpdate: Date;
}