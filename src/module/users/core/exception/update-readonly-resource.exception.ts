import {ExceptionEnum} from './enum/exception.enum';

export class UpdateReadonlyResourceException extends Error {
  readonly action: string;
  readonly isOperation: boolean;

  constructor() {
    super('You can not update readonly resource!');

    this.action = ExceptionEnum.UPDATE_READONLY_RESOURCE;
    this.isOperation = true;
  }
}
