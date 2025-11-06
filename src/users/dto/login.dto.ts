import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Email address', example: 'johndoe@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password', example: 'strongpassword123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
