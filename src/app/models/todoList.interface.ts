import { Users } from "./users.interface";

export type TodoStatus = "pending" | "in-progress" | "cancelled" | "completed";

export interface TodoList {
    id: number;
    task: string;
    user: Users;
    date: Date;
    lastUpdate: Date;
    status: TodoStatus;
    dueDate: Date;
    checked: boolean;
}
