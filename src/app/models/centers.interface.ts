import { PhotoResponse, VideoResponse } from "./Media.interface";

export interface Centers {
  id: number;
  name: string;
  motto: string;
  address: string;
  experience: string;
  location: string;
  /** Same nested shape Trainers.photoResponse already uses -- was a flat `photoUrl` that the API never actually sent, so every center image silently fell back to a placeholder. */
  photoResponse: PhotoResponse;
  likes: number;
  status: string;
  userId: number;
  partnerId: number;
  categoryIds: number[];
  date: Date;
  lastUpdate: Date;
  message?: string;
}

export interface CenterLikes {
  id: number;
  centerId: number;
  centerName: string;
  userId: number;
  userEmail: string;
  date: Date;
}

export interface CenterPricing {
  id: number;
  centerId: number;
  centerName: string;
  price: number;
  discount3Months: number;
  discount6Months: number;
  discount9Months: number;
  discount12Months: number;
  discount2Programs: number;
  date: Date;
  lastUpdate: Date;
  message?: string;
}

export interface CenterStatistics {
  id: number;
  centerId: number;
  members: number;
  experience: number;
  membersCounter: number;
  experienceCounter: number;
  ratings: number;
  ratingsCounter: number;
  date: string;
}

export interface HeroCenterAlbum {
  id: number;
  centerId: number;
  name: string;
  photoUrl: string;
  comment: string;
}


export interface CenterCategory {
  id: number;
  centerId: number;
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

export interface CenterEquipment {
  id: number;
  centerId: number;
  centerName: string;
  trainerId: number;
  trainerName: string;
  featured: boolean;
  name: string;
  description: string;
  stockNumber: number;
  imageUrl: string;
  sideViewUrl: string;
  rearViewUrl: string;
  frontViewUrl: string;
  categoryIds: number[];
  lastUpdate: Date;
  date: Date;
  message?: string;
}

export interface CenterTrainers {
  id: number;
  centerId: number;
  centerName: string;
  /** The center's own photo -- mirrors CenterTrainerResponse.photoResponse on the backend. */
  photoResponse?: PhotoResponse;
  trainerId: number;
  trainerName: string;
  status: string;
  date: Date;
  lastUpdate: Date;
  message?: string;
}

export interface CenterPromotions {
  id: number;
  centerId: number;
  promotions: { promotion: string }[];
  imageUrl: string;
  date: string;
}

export interface CenterAnnouncements {
  id: number;
  centerId: number;
  centerName: string;
  announcement: string;
  iconUrl: string;
  status: string;
  lastUpdate: Date;
  date: Date;
  message?: string;
}

export interface CenterPhotoAlbum {
  id: number;
  centerId: number;
  centerName: string;
  comment: string;
  photos: PhotoResponse[];
  lastUpdate: Date;
  date: Date;
  message?: string;
}

export interface CenterVideoAlbum {
  id: number;
  centerId: number;
  centerName: string;
  comment: string;
  videos: VideoResponse[];
  lastUpdate: Date;
  date: Date;
  message?: string;
}

export interface CenterSubscriptionForm {
  id: number;
  centerId: number;
  whatsapp: string;
  name: string;
}

export interface CenterIntroduction {
  id: number;
  centerId: number;
  centerName: string;
  introduction: string;
  lastUpdate: Date;
  date: Date;
  message?: string;
}

export interface CenterReviews {
  id: number;
  centerId: number;
  centerName: string;
  memberId: number;
  memberName: string;
  comment: string;
  likes: number;
  status: string;
  date: Date;
  lastUpdate: Date;
  message?: string;
}

export interface CenterLocations {
  id: number;
  centerId: number;
  centerName: string;
  subName: string;
  locationUrl: string;
  address: string;
  coverPhotoUrl: string;
  lastUpdate: Date;
  date: Date;
  message?: string;
}