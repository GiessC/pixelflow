export class BaseError extends Error {
  private _name: string;
  private _message: string;

  constructor(message: string) {
    super(message);
    this._name = this.constructor.name;
    this._message = message;
    console.error(this);
  }

  get name(): string {
    return this._name;
  }

  protected set name(newName: string) {
    this._name = newName;
  }

  get message(): string {
    return this._message;
  }

  protected set message(newMessage: string) {
    this._message = newMessage;
  }
}
