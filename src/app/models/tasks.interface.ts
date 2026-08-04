export interface Tasks {
    id: number;
    userId: number;
    userFirstname: string;
    userLastname: string;
    userEmail: string;
    trainerId: number;
    trainerName: string;
    description: string;
    priority: string;
    subTasks: SubTasks[];
    startDate: Date;
    endDate: Date;
    date: Date;
    lastUpdate: Date;
    status: string;
    message?: string;
  }

  export interface SubTasks {
    id: number;
    name: string;
    taskId: number;
    exerciseId: number;
    exerciseName: string;
    date: Date;
    message?: string;
  }
