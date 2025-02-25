import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty({ message: "Name can not be empty" })
    @IsString()
    name: string;

    @IsNotEmpty({ message: 'Email cant be empty' })
    @IsEmail({}, { message: "Invalid email" })
    email: string;

    @IsNotEmpty({ message: 'password cant be empty' })
    password: string;


    phone: string;


    address: string;


    image: string;



}
