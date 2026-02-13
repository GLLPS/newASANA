import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateBigtimeProjectDto {
  @IsUUID()
  clientId!: string;

  @IsString()
  bigtimeProjectId!: string;

  @IsString()
  @IsOptional()
  sharepointFolderId?: string;
}
