import { IsString, IsUUID, IsEmail, IsOptional, IsDateString } from 'class-validator';

export class CreateActionDto {
  @IsUUID()
  clientId!: string;

  @IsUUID()
  siteId!: string;

  @IsUUID()
  inspectionId!: string;

  @IsUUID()
  findingId!: string;

  @IsString()
  description!: string;

  @IsString()
  responsibleName!: string;

  @IsOptional()
  @IsEmail()
  responsibleEmail?: string;

  @IsDateString()
  dueDate!: string;
}
