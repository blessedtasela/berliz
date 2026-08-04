import { Users } from "./users.interface";

export interface AuthResponse {

    accessToken: string;
    refreshToken: string;
    message?: string;
    user: Users;

}