import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleDto {
  @ApiProperty({
    description: 'Google ID token from client',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @ApiProperty({
    description: 'Optional google sub (id) if available',
    example: '11345678901234567890',
  })
  @IsOptional()
  @IsString()
  google_id?: string;

  @ApiProperty({
    description: 'Optional email from client',
    example: 'johndoe@gmail.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Optional username suggestion',
    example: 'john_doe',
  })
  @IsOptional()
  @IsString()
  username?: string;
}
