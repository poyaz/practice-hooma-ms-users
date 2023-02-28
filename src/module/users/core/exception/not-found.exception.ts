import {ExceptionEnum} from './enum/exception.enum';

export class NotFoundException extends Error {
  readonly action: string;
  readonly isOperation: boolean;

  constructor() {
    super('Your path or object request not found!');

    this.action = ExceptionEnum.NOT_FOUND_ERROR;
    this.isOperation = true;
  }
}
