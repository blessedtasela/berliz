import {
    Trainers,
    TrainerBenefits,
    TrainerClients,
    TrainerFeatureVideo,
    TrainerIntroduction,
    TrainerPhotoAlbum,
    TrainerPricing,
    TrainerReview,
    TrainerReviewLikes,
    TrainerSubscription,
    TrainerTestimonials,
    TrainerVideoAlbum,
    TrainerLikes,
} from '../../models/trainers.interface';
import { CenterTrainers } from '../../models/centers.interface';

export interface TrainerState {
    loading: boolean;
    error: string | null;

    // Trainers
    trainers: Trainers[];
    activeTrainers: Trainers[];
    currentTrainer: Trainers | null;

    // Center Trainers
    centerTrainers: CenterTrainers[];
    myCenterTrainers: CenterTrainers[];

    // Likes
    trainerLikes: TrainerLikes[];
    myTrainerLikes: TrainerLikes[];

    // Pricing
    trainerPricing: TrainerPricing[];
    myTrainerPricing: TrainerPricing | null;

    // Benefits
    trainerBenefits: TrainerBenefits[];
    myTrainerBenefit: TrainerBenefits | null;

    // Introductions
    trainerIntroductions: TrainerIntroduction[];
    myTrainerIntroduction: TrainerIntroduction | null;

    // Feature Videos
    trainerFeatureVideos: TrainerFeatureVideo[];
    myTrainerFeatureVideos: TrainerFeatureVideo[];
    activeTrainerFeatureVideos: TrainerFeatureVideo[];

    // Photo Albums
    trainerPhotoAlbums: TrainerPhotoAlbum[];
    myTrainerPhotoAlbum: TrainerPhotoAlbum | null;

    // Video Albums
    trainerVideoAlbums: TrainerVideoAlbum[];
    myTrainerVideoAlbum: TrainerVideoAlbum | null;

    // Clients
    trainerClients: TrainerClients[];
    trainerActiveClients: TrainerClients[];

    // Subscriptions
    trainerSubscriptions: TrainerSubscription[];
    activeTrainerSubscriptions: TrainerSubscription[];
    myTrainerSubscription: TrainerSubscription | null;

    // Reviews
    trainerReviews: TrainerReview[];
    activeTrainerReviews: TrainerReview[];
    myTrainerReviews: TrainerReview[];
    trainerReviewLikes: TrainerReviewLikes[];

    // Testimonials
    trainerTestimonials: TrainerTestimonials[];
    myTrainerTestimonials: TrainerTestimonials[];
}

export const initialTrainerState: TrainerState = {
    loading: false,
    error: null,

    trainers: [],
    activeTrainers: [],
    currentTrainer: null,

    centerTrainers: [],
    myCenterTrainers: [],

    trainerLikes: [],
    myTrainerLikes: [],

    trainerPricing: [],
    myTrainerPricing: null,

    trainerBenefits: [],
    myTrainerBenefit: null,

    trainerIntroductions: [],
    myTrainerIntroduction: null,

    trainerFeatureVideos: [],
    myTrainerFeatureVideos: [],
    activeTrainerFeatureVideos: [],

    trainerPhotoAlbums: [],
    myTrainerPhotoAlbum: null,

    trainerVideoAlbums: [],
    myTrainerVideoAlbum: null,

    trainerClients: [],
    trainerActiveClients: [],

    trainerSubscriptions: [],
    activeTrainerSubscriptions: [],
    myTrainerSubscription: null,

    trainerReviews: [],
    activeTrainerReviews: [],
    myTrainerReviews: [],
    trainerReviewLikes: [],

    trainerTestimonials: [],
    myTrainerTestimonials: [],
};