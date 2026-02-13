import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateClientDto {
  @IsString()
  name!: string;

  @IsBoolean()
  @IsOptional()
  weeklySummaryEnabled?: boolean;
}
