import { IsUUID, IsString, IsEmail, IsBoolean, IsOptional } from 'class-validator';

export class CreateContactDto {
  @IsUUID()
  clientId!: string;

  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsBoolean()
  @IsOptional()
  receiveInspectionsDefault?: boolean;
}
