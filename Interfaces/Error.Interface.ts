export interface AppError {
  code: string;
  message: string;
  cause?: unknown;
}
