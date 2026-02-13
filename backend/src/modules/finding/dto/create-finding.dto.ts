import { IsString, IsUUID, IsEnum, IsBoolean, IsOptional } from 'class-validator';

export class CreateFindingDto {
  @IsUUID()
  inspectionId!: string;

  @IsString()
  category!: string;

  @IsEnum(['Issue', 'Positive'])
  status!: 'Issue' | 'Positive';

  @IsEnum(['Low', 'Medium', 'High'])
  severity!: 'Low' | 'Medium' | 'High';

  @IsEnum(['OSHA', 'Behavioral', 'Equipment', 'Process'])
  riskType!: 'OSHA' | 'Behavioral' | 'Equipment' | 'Process';

  @IsOptional()
  @IsString()
  oshaRef?: string;

  @IsOptional()
  @IsBoolean()
  correctedOnSite?: boolean;
}
