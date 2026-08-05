export interface Categories {
    id: number;
    name: string;
    description: string;
    photoUrl: string;
    photoId: number;
    tagIds: number[];
    tagNames: string[];
    likes: number;
    date: Date;
    lastUpdate: Date;
    status: string;
    message?: string;
}

export interface Icons {
    id: number;
    name: string;
}

export interface CategoryLikes {
    id: number,
    categoryId: number;
    categoryName: string;
    userId: number;
    userEmail: string;
    date: Date;
}

// NOTE: CategoryIntroduction / CategoryBenefits / CategoryTags / CategoryVotes
// used to live here. They had no backing endpoint, no service method and no
// NgRx state — purely speculative shapes wired to placeholder components — so
// they were removed along with those components. The service detail page now
// derives its content from the real `Categories` fields plus the
// trainer/center/exercise relations.