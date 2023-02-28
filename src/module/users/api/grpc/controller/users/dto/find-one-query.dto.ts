import {IsDefined, IsUUID} from 'class-validator';

export class FindOneQueryDto {
  @IsUUID()
  @IsDefined()
  userId: string;

  static toModel(dto: FindOneQueryDto): string {
    return dto.userId;
  }
}
