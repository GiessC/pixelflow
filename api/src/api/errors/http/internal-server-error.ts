import { BaseError } from '../base-error';

export class InternalServerError extends BaseError {
  public statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'InternalServerError';
    this.statusCode = 500;
  }
}
