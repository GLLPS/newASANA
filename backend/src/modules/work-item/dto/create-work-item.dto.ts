import { IsString, IsUUID, IsEnum, IsOptional, IsDateString } from 'class-validator';

export enum WorkItemType {
  Inspection = 'Inspection',
  Training = 'Training',
}

export class CreateWorkItemDto {
  @IsString()
  externalSource!: string;

  @IsString()
  externalId!: string;

  @IsEnum(WorkItemType)
  type!: WorkItemType;

  @IsUUID()
  clientId!: string;

  @IsUUID()
  bigtimeProjectId!: string;

  @IsUUID()
  @IsOptional()
  siteId?: string;

  @IsUUID()
  assignedToUserId!: string;

  @IsDateString()
  scheduledDate!: string;
}
