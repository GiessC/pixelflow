import { HttpError } from './http-error';

export class InternalServerError extends HttpError {
  constructor(message: string) {
    super(message, 500);
    this.name = 'InternalServerError';
    this.userFriendlyMessage =
      'An unexpected error occurred. Please try again later.';
  }
}
