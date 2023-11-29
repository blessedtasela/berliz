export interface Exercises {
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