export interface ApiResponse<T> {
  message: string;
  data: T;
  success: boolean;
  statusCode: number;
}

