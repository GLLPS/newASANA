import { IsString, IsEmail, IsEnum, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsEnum(['Admin', 'Staff'])
  role!: 'Admin' | 'Staff';
}
