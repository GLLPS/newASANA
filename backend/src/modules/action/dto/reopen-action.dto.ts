import { IsString, IsDateString } from 'class-validator';

export class ReopenActionDto {
  @IsDateString()
  newDueDate!: string;

  @IsString()
  reason!: string;
}
