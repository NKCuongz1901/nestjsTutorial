import { IsMongoId, IsNotEmpty, IsOptional } from "class-validator";


export class UpdateUserDto {
    @IsMongoId({ message: 'Invalid Id ' })
    @IsNotEmpty({ message: 'Id must not empty' })
    _id: string;

    @IsOptional()
    name: string;

    @IsOptional()
    phone: string;

    @IsOptional()
    address: string;

    @IsOptional()
    image: string;
}
