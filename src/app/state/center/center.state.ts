import {
    Centers,
    CenterLikes,
    CenterAnnouncements,
    CenterEquipment,
    CenterIntroduction,
    CenterLocations,
    CenterPhotoAlbum,
    CenterPricing,
    CenterTrainers,
    CenterVideoAlbum,
    CenterReviews,
} from '../../models/centers.interface';

export interface CenterState {
    loading: boolean;
    error: string | null;

    // Centers
    centers: Centers[];
    activeCenters: Centers[];
    currentCenter: Centers | null;

    // Likes
    centerLikes: CenterLikes[];

    // Announcements
    centerAnnouncements: CenterAnnouncements[];
    myCenterAnnouncements: CenterAnnouncements[];
    activeCenterAnnouncements: CenterAnnouncements[];

    // Equipment
    centerEquipment: CenterEquipment[];
    myCenterEquipment: CenterEquipment[];

    // Introductions
    centerIntroductions: CenterIntroduction[];
    myCenterIntroductions: CenterIntroduction[];

    // Locations
    centerLocations: CenterLocations[];
    myCenterLocations: CenterLocations[];

    // Photo Albums
    centerPhotoAlbums: CenterPhotoAlbum[];
    myCenterPhotoAlbums: CenterPhotoAlbum[];

    // Pricing
    centerPricing: CenterPricing[];
    myCenterPricing: CenterPricing | null;

    // Trainers
    centerTrainers: CenterTrainers[];
    myCenterTrainers: CenterTrainers[];

    // Video Albums
    centerVideoAlbums: CenterVideoAlbum[];
    myCenterVideoAlbums: CenterVideoAlbum[];

    // Reviews
    centerReviews: CenterReviews[];
    myCenterReviews: CenterReviews[];
    activeCenterReviews: CenterReviews[];
}

export const initialCenterState: CenterState = {
    loading: false,
    error: null,

    centers: [],
    activeCenters: [],
    currentCenter: null,

    centerLikes: [],

    centerAnnouncements: [],
    myCenterAnnouncements: [],
    activeCenterAnnouncements: [],

    centerEquipment: [],
    myCenterEquipment: [],

    centerIntroductions: [],
    myCenterIntroductions: [],

    centerLocations: [],
    myCenterLocations: [],

    centerPhotoAlbums: [],
    myCenterPhotoAlbums: [],

    centerPricing: [],
    myCenterPricing: null,

    centerTrainers: [],
    myCenterTrainers: [],

    centerVideoAlbums: [],
    myCenterVideoAlbums: [],

    centerReviews: [],
    myCenterReviews: [],
    activeCenterReviews: [],
};