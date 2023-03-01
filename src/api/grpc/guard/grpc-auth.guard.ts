import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {Observable} from 'rxjs';
import {JwtService} from '@nestjs/jwt';

@Injectable()
export class GrpcAuthGuard implements CanActivate {
  constructor(private readonly _jwtService: JwtService) {
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'rpc') {
      return true;
    }

    const metadata = context.getArgByIndex(1);
    if (!metadata) {
      return false;
    }

    const prefix = 'Bearer ';
    const header = metadata.get('Authorization')[0];
    if (!header || !header.includes(prefix)) {
      return false;
    }

    const token = header.slice(header.indexOf(' ') + 1);
    try {
      this._jwtService.verify(token);

      return true;
    } catch (error) {
      return false;
    }
  }
}
