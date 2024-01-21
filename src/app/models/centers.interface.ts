import { Categories } from "./categories.interface";
import { Users } from "./users.interface";

export interface Centers {
  id: number;
  name: string;
  motto: string;
  address: string;
  experience: string;
  location: string;
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

export interface CenterLike {
  id: number,
  user: Users;
  center: Centers;
  date: Date;
}

export interface CenterPricing {
  id: number;
  center: Centers;
  price: number;
  discount3Months: number;
  discount6Months: number;
  discount9Months: number;
  discount12Months: number;
  discount2Programs: number;
  date: Date;
  lastUpdate: Date;
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
  center: Centers;
  name: string;
  description: string;
  categories: Categories[];
  image: any;
  stockNumber: number;
  lastUpdate: Date;
  date: Date;
}

export interface CenterTrainers {
  id: number;
  centerId: number;
  trainers: {
    id: number;
    name: string;
    categories: string[];
    imageUrl: string;
    motto: string;
    experience: string;
    ratings: number;
    date: string;
  }[];
  date: string;
}

export interface CenterPromotions {
  id: number;
  centerId: number;
  promotions: { promotion: string }[];
  imageUrl: string;
  date: string;
}

export interface CenterAnnouncement {
  id: number;
  center: Centers;
  announcement: string;
  icon: any;
  lastUpdate: Date;
  date: Date;
}

export interface CenterPhotoAlbum {
  id: number;
  center: Centers;
  uuid: string;
  photo: any;
  comment: string;
  lastUpdate: Date;
  date: Date;
}

export interface CenterVideoAlbum {
  id: number;
  center: Centers;
  name: string;
  video: any;
  comment: string;
  lastUpdate: Date;
  date: Date;
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
  introduction: string;
  coverPhoto: any;
  lastUpdate: Date;
  date: Date;
}

export interface CenterReview {
  id: number;
  center: Centers;
  user: Users;
  comment: string;
  likes: number;
  status: string;
  date: Date;
  lastUpdate: Date;
}

export interface CenterLocation {
  id: number;
  center: Centers;
  subName: string;
  locationUrl: string;
  address: string;
  coverPhoto: any;
  ratings: number;
  lastUpdate: Date;
  date: Date;
}