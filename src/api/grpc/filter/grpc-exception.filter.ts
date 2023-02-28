import {
  ArgumentsHost,
  Catch,
  RpcExceptionFilter,
  UnprocessableEntityException,
} from '@nestjs/common';
import {Observable, throwError} from 'rxjs';
import {status, Metadata} from '@grpc/grpc-js';

export enum ExceptionEnum {
  UNPROCESSABLE_ENTITY_ERROR = 'UNPROCESSABLE_ENTITY_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

@Catch()
export class GrpcExceptionFilter<T> implements RpcExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): Observable<any> {
    const serverMetadata = new Metadata();

    if (exception instanceof UnprocessableEntityException) {
      serverMetadata.add('action', ExceptionEnum.UNPROCESSABLE_ENTITY_ERROR);
      serverMetadata.add('isOperation', '1');
      (<Array<string>><unknown>exception.getResponse()['message'] || []).map((v) => serverMetadata.add('message', v));

      return throwError(() => ({
        code: status.INVALID_ARGUMENT,
        message: exception.message,
        metadata: serverMetadata,
      }));
    }

    serverMetadata.add('action', exception['action'] || ExceptionEnum.UNKNOWN_ERROR);
    serverMetadata.add('isOperation', 'isOperation' in <Error><unknown>exception ? exception['isOperation'] ? '1' : '0' : '0');

    let code;
    switch (true) {
      default:
        code = status.UNKNOWN;
    }

    return throwError(() => ({
      code: code,
      message: exception.message,
      details: exception.message,
      metadata: serverMetadata,
    }));
  }
}
