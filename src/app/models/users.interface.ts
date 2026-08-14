import { ApiResponse } from "./Api.interface";
import { AuthResponse } from "./Auth.interface";
import { Testimonials } from "./testimonials.model";
import { WorkoutResponse } from "./workout.interface";

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

    /** "public" | "private" — what /user/getPublicProfile/{id} is allowed to expose. */
    profileVisibility?: ProfileVisibility;

    date: string;
    lastUpdate: string;

    message?: string;
}

export type ProfileVisibility = 'public' | 'private';

/**
 * Mirrors the backend `PublicUserProfileResponse`.
 *
 * The first block is always present. Everything below `isPrivate` is only sent
 * when the owner set their visibility to "public" — when `isPrivate` is true
 * those fields are absent and the UI shows the private state instead.
 */
export interface PublicUserProfile {
    id: number;
    firstname: string;
    lastname: string;
    role: string;
    profilePhoto: any;
    memberSince: string;
    isPrivate: boolean;

    bio?: string;
    city?: string;
    country?: string;
    workoutsCreated?: WorkoutResponse[];

    /** Trainer-only: this trainer's active testimonials. Absent for every other role. */
    testimonials?: Testimonials[];

    message?: string;
}

/**
 * One row in the anonymous-facing member directory (`GET /user/getPublicDirectory`).
 * Mirrors the backend `PublicDirectoryEntryResponse` — deliberately lighter than
 * `PublicUserProfile` (no `workoutsCreated`) since this backs a list, not a single page.
 */
export interface PublicDirectoryEntry {
    id: number;
    firstname: string;
    lastname: string;
    role: string;
    profilePhoto: any;
    city?: string;
    country?: string;
    memberSince: string;
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