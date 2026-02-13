import { IsEnum, IsOptional, IsArray, IsUUID } from 'class-validator';

export class SubmitInspectionDto {
  @IsEnum(['Draft', 'Final'])
  submitType!: 'Draft' | 'Final';

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  contactIds?: string[];

  @IsOptional()
  timeEntry?: number;
}
