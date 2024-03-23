import { Clients } from "./clients.interface";

export interface Trainers {
  id: number;
  name: string;
  motto: string;
  address: string;
  experience: string;
  photo: string;
  likes: number;
  partner: {
    id: number;
    motivation: string;
    user: {
      id: number;
      email: string;
      role: string;
    }
  }
  categorySet: {
    id: number;
    name: string;
    description: string;
    photo: string;
    tagSet: {
      id: number;
      name: string;
    }[];
    likes: number;
  }[];
  date: Date;
  lastUpdate: Date;
  status: string;
}

export interface TrainerPricing {
  id: number;
  trainer: Trainers;
  priceOnline: number;
  priceHybrid: number;
  pricePersonal: number;
  discount3Months: number;
  discount6Months: number;
  discount9Months: number;
  discount12Months: number;
  discount2Programs: number;
  date: Date;
  lastUpdate: Date;
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

export interface TrainerPhotoAlbum {
  id: number;
  trainer: Trainers;
  photo: any;
  comment: string;
  date: Date;
  lastUpdate: Date;
}

export interface TrainerVideoAlbum {
  id: number;
  trainer: Trainers;
  video: any;
  comment: string;
  date: Date;
  lastUpdate: Date;
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

export interface TrainerBenefits {
  id: number;
  trainerId: number;
  benefit: string;
  date: Date;
  lastUpdate: Date;
}

export interface TrainerReview {
  id: number;
  trainer: Trainers;
  client: Clients;
  frontBefore: any;
  frontAfter: any;
  sideBefore: any;
  sideAfter: any;
  backBefore: any;
  backAfter: any;
  review: string;
  likes: number;
  date: Date;
  lastUpdate: Date;
  status: string;
}

export interface TrainerClientSubscription {
  id: number;
  clientId: number;
  trainerId: number;
  plan: string;
  mode: string;
  categories: string;
  date: string;
}

export interface TrainerFeatureVideo {
  id: number;
  trainer: Trainers;
  video: any;
  motivation: string;
  date: Date;
  lastUpdate: Date;
}

export interface TrainerSubscriptionForm {
  id: number;
  trainerId: number;
  whatsapp: string;
  name: string;
}

export interface TrainerIntrodution {
  id: number;
  trainer: Trainers;
  introduction: string;
  coverPhoto: any;
  date: Date;
  lastUpdate: Date;
}

export interface TrainerClients {
  id: number;
  trainer: Trainers;
  photo: any;
  comment: string;
  date: Date;
  lastUpdate: Date;
}