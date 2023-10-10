
export interface Categories {
    id: number;
    name: string;
    description: string;
    photo: string;
    tagSet: {
        id: number;
        name: string;
        description: string;
    }[];
    likes: number;
    date: Date;
    lastUpdate: Date;
    status: string;
}

export interface Icons {
    id: number;
    name: string;
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