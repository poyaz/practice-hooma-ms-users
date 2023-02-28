import {Injectable} from '@nestjs/common';
import * as uuid from 'uuid';
import {IdentifierInterface} from '../../core/interface/identifier.interface';

@Injectable()
export class UuidIdentifier implements IdentifierInterface {
  private readonly _nameSpaceUuid: string = '4e792c4b-0ad6-4d54-aee2-e43cb1870c33';

  constructor(nameSpaceUuid?: string) {
    if (nameSpaceUuid) {
      this._nameSpaceUuid = nameSpaceUuid;
    }
  }

  generateId(): string;
  generateId(data: string): string;
  generateId(data?: string): string {
    if (!data) {
      return uuid.v4();
    }

    return uuid.v5(data, this._nameSpaceUuid);
  }
}
