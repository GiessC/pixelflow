export class HttpError extends Error {
  public readonly statusCode: number;
  private _userFriendlyMessage?: string;

  constructor(
    message: string,
    statusCode: number,
    userFriendlyMessage?: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this._userFriendlyMessage = userFriendlyMessage;
    this.name = 'HttpError';
  }

  public get userFriendlyMessage(): string | undefined {
    return this._userFriendlyMessage;
  }

  protected set userFriendlyMessage(value: string | undefined) {
    this._userFriendlyMessage = value;
  }
}
