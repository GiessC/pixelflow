import { BaseError } from '../base-error';

export class InternalServerError extends BaseError {
  public readonly statusCode: number = 500;

  constructor(message: string) {
    super(message);
    this.name = 'InternalServerError';
  }
}
