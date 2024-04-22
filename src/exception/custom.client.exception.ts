import { HttpException } from '@nestjs/common';

export class CustomClientException extends HttpException {
  #errorName: string;
  constructor(message: string, statusCode: number, name: string) {
    super(message, statusCode);
    this.#errorName = name;
  }
  public getErrorName(): string {
    return this.#errorName;
  }
}
