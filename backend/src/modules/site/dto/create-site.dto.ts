import { IsUUID, IsString } from 'class-validator';

export class CreateSiteDto {
  @IsUUID()
  clientId!: string;

  @IsString()
  name!: string;
}
