import {ExceptionEnum} from './enum/exception.enum';

export class RepositoryException extends Error {
  readonly action: string;
  readonly isOperation: boolean;
  readonly cause: Error;
  readonly combine: Array<Error>;

  constructor(error: Error, parentError?: RepositoryException) {
    super('Repository error!');

    this.action = ExceptionEnum.REPOSITORY_ERROR;
    this.isOperation = false;

    if (parentError) {
      this.cause = parentError.cause;
      this.combine = [...parentError.combine, error];
    } else {
      this.cause = error;
      this.combine = [];
    }
  }
}
