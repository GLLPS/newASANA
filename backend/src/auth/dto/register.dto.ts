import { IsEmail, IsString, MinLength, IsEnum, IsUUID } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsUUID()
  tenantId!: string;

  @IsEnum(['Admin', 'Staff'])
  role!: 'Admin' | 'Staff';
}
