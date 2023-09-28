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
    motiation: string;
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
        description: string;
        date: Date;
        lastUpdate: Date;
        status: string;
    }[];
    likes: number;
    date: Date;
    lastUpdate: Date;
    status: string;
  }[];
  date: Date;
  lastUpdate: Date;
  status: string;
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

export interface TrainerAlbum {
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

export interface TrainerBenefits {
  id: number;
  trainerId: number;
  benefits: { benefit: string }[];
  imageUrl: string;
  date: string;
}

export interface TrainerClientReview {
  id: number;
  trainerId: number;
  reviews: {
    clientId: number;
    name: string;
    beforeImageUrl: string;
    afterImageUrl: string;
    comment: string;
  }[];
  date: string;
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
  trainerId: number;
  video: {
    videoUrl: string;
    motto: string;
  }[];
  date: string
}

export interface TrainerSubscriptionForm {
  id: number;
  trainerId: number;
  whatsapp: string;
  name: string;
}

export interface TrainerIntrodution {
  id: number;
  trainerId: number;
  paragraphs: { paragraph: string }[];
  videoUrl: string;
  date: string;
}