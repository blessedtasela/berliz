import { ApiResponse } from "./Api.interface";
import { AuthResponse } from "./Auth.interface";

export interface Users {
    id: number;

    firstname: string;
    lastname: string;
    phone: string;
    dob: string;
    gender: string;

    country: string;
    state: string;
    city: string;
    postalCode: string;

    address: string;
    bio: string;

    email: string;
    role: string;

    profilePhoto: any;

    likedCategories: Category[];

    status: string;

    date: string;
    lastUpdate: string;

    message?: string;
}

export interface Category {
    id: number;
    name: string;
    description: string;
}

export interface Login {
    email: string;
    password: string;
}

export interface Role {
    id: number;
    role: string;
}


export interface LoginResponse extends ApiResponse<AuthResponse> {}