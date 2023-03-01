import {ExceptionEnum} from './enum/exception.enum';

export class DeleteReadonlyResourceException extends Error {
  readonly action: string;
  readonly isOperation: boolean;

  constructor() {
    super('You can not delete readonly resource!');

    this.action = ExceptionEnum.DELETE_READONLY_RESOURCE;
    this.isOperation = true;
  }
}
