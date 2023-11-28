import { Users } from "./users.interface";

export interface TodoList {
    id: number;
    task: string;
    user: Users;
    date: Date;
    lastUpdate: Date;
    status: string;
}