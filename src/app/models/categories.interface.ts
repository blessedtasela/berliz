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

export interface CategoryIntroduction {
    categoryId: number;
    paragraphs: string[];
    imageUrl: string;
    ratings: number;
    date: string;
}

export interface CategoryBenefits {
    categoryId: number;
    benefits: string[];
    imageUrl: string;
    date: string;
}

export interface CategoryTags {
    categoryId: number;
    tags: {
        tag: string;
        description: string;
    }[];
    date: string;
}

export interface CategoryVotes {

}