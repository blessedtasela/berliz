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

export interface CenterVideoAlbum {
  id: number;
  centerId: number;
  name: string;
  videos: {
    videoUrl: string;
    comment: string;
  }[];
  date: string;
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
  equipments: {
    equipmentName: string;
    description: string;
    categories: string[];
    imageUrl: string;
    stockNumber: number;
    date: string;
  }[];
  date: string;
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
  centerId: number;
  announcements: {
    announcement: string,
    imageUrl: string
    date: string
  }[];
  date: string;
}

export interface CenterAlbum {
  id: number;
  centerId: number;
  name: string;
  photos: {
    photo: string;
    comment: string;
  }[];
  date: string;
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
  paragraphs: { paragraph: string }[];
  imageUrl: string;
  date: string;
}

export interface CenterReview {
  id: number;
  centerId: number;
  reviews : {
    userName: string;
    photo: string;
    comment: string;
    likes: number;
    date: string;
  }[];
  date: string;
}

export interface CenterLocation {
  id: number;
  centerId: number;
  location: {
    locationId: number;
    name: string;
    address: string;
    imageUrl: string;
    ratings: number;
  }[];
  date: string;
}