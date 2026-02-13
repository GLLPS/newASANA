import { IsIn, IsOptional, IsArray, IsEmail, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitInspectionDto {
  @IsIn(['Draft', 'Final'])
  submitType!: 'Draft' | 'Final';

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  contactEmails?: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  timeEntry?: number;
}
