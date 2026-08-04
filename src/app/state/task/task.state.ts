import { Tasks, SubTasks } from '../../models/tasks.interface';

export interface TaskState {
    loading: boolean;
    error: string | null;

    tasks: Tasks[];
    activeTasks: Tasks[];
    trainerTasks: Tasks[];
    clientTasks: Tasks[];
    selectedTask: Tasks | null;

    subTasks: SubTasks[];
}

export const initialTaskState: TaskState = {
    loading: false,
    error: null,

    tasks: [],
    activeTasks: [],
    trainerTasks: [],
    clientTasks: [],
    selectedTask: null,

    subTasks: [],
};
