import { IsEnum, IsOptional, IsArray, IsEmail } from 'class-validator';

export class SubmitInspectionDto {
  @IsEnum(['Draft', 'Final'])
  submitType!: 'Draft' | 'Final';

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  contactEmails?: string[];

  @IsOptional()
  timeEntry?: number;
}
