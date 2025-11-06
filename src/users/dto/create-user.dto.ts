import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { role, status } from "../entities/user.entity";



export class CreateUserDto {
    @ApiProperty({description: 'Username', example: 'john_doe'})
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({description: 'Email address', example: 'johndoe@gmail.com'})
    @IsEmail()
    email: string;

    @ApiProperty({description: 'Phone number', example: '+1234567890'})
    @IsString()
    phone?: string;

    @ApiProperty({description: 'Google ID', example: 'google-1234567890'})
    @IsString()
    google_id?: string;

    @ApiProperty({description: 'Password', example: 'strongpassword123'})
    @IsString()
    password?: string;

    @ApiProperty({description: 'User role', example: 'client'})
    role?: role;

    @ApiProperty({description: 'Account status', example: 'active'})
    status?: status;    
}
