import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateAuthDto {
    @IsNotEmpty({ message: "You must fill out username" })
    @IsEmail({}, { message: "Invalid email" })
    username: string;

    @IsNotEmpty({ message: "You must fill out username" })
    @IsString()
    name: string;

    @IsNotEmpty({ message: "You must fill out password" })
    password: string



}
