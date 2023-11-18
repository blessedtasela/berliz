import { Users } from "./users.interface";

export interface TodoList {
    id: number;
    task: number;
    user: Users;
    date: Date;
    lastUpdate: Date;
    status: string;
}