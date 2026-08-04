import { TodoList } from '../../models/todoList.interface';

export interface TodoState {
    loading: boolean;
    error: string | null;
    lastMessage: string | null;

    todos: TodoList[];
    myTodos: TodoList[];
}

export const initialTodoState: TodoState = {
    loading: false,
    error: null,
    lastMessage: null,

    todos: [],
    myTodos: [],
};
