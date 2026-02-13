import { IsString, IsUUID, IsEnum, IsOptional } from 'class-validator';

export class CreateInspectionDto {
  @IsOptional()
  @IsUUID()
  workItemId?: string;

  @IsUUID()
  bigtimeProjectId!: string;

  @IsUUID()
  siteId!: string;

  @IsEnum(['StandardPDF', 'DraftWord'])
  reportType!: 'StandardPDF' | 'DraftWord';
}
