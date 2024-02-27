import { Trainers } from "./trainers.interface";

export interface Users {
    id: number,
    firstname: string,
    lastname: string,
    phone: string,
    bio: string,
    dob: string,
    gender: string,
    country: string,
    state: string,
    city: string,
    postalCode: number,
    address: string,
    profilePhoto: any;
    email: string,
    role: string;
    likedCategoriesSet: {
        id: number;
        name: string;
        description: string;
    }[];
    token: string;
    date: string;
    lastUpdate: string;
    status: string;
}

export interface Login {
    email: string,
    password: string
}

export interface TrainerLike {
    id: number,
    user: Users;
    trainer: Trainers;
    date: Date;
}

export interface Role {
    id: number,
    role: string
}

