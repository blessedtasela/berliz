import { Users } from "./users.interface";

export type TodoStatus = "pending" | "in-progress" | "cancelled" | "completed" | "paused";

export type Priority = 'high' | 'normal' | 'low' | 'due';

export enum TodoPriority {
    HIGH = 'HIGH',
    NORMAL = 'NORMAL',
    LOW = 'LOW'
}

export interface TodoList {
    id: number;
    task: string;
    date: Date;
    lastUpdate: Date;
    status: TodoStatus;
    dueDate: Date;
    checked: boolean
    priority: Priority;
    userFirstname: string;
    userLastname: string;
    userId: number;
    userEmail: string;
}
