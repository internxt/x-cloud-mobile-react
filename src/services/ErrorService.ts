import AppError from '../types';

class ErrorService {
  public castError(err: unknown): AppError {
    let castedError: AppError = new AppError('Unknown error');

    if (typeof err === 'string') {
      castedError = new AppError(err);
    } else if (err instanceof Error) {
      castedError.message = err.message;
    } else {
      const map = err as Record<string, unknown>;
      castedError = map.message ? new AppError(map.message as string, map.status as number) : castedError;
    }

    return castedError;
  }
}

const errorService = new ErrorService();
export default errorService;