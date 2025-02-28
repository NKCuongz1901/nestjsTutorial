import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.schema';
import mongoose, { Model } from 'mongoose';
import { hashPasswordHelper } from 'src/helpers/ultil';
import aqp from 'api-query-params';
import { CreateAuthDto } from 'src/auth/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class UsersService {
  constructor(@
    InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: MailerService

  ) { };

  isExistingEmail = async (email: string) => {
    const user = await this.userModel.exists({ email });
    if (user) {
      return true;
    }
    return false;
  }

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, address, phone, image } = createUserDto;
    //check email
    const existsEmail = await this.isExistingEmail(email);
    if (existsEmail) {
      throw new BadRequestException(`Email ${email} is existing, please using another email`);
    }
    //hash password
    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      name, email, password: hashPassword, address, phone, image
    });
    return {
      _id: user._id
    };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItem = (await this.userModel.find(filter)).length;
    const totalPage = Math.ceil(totalItem / pageSize);
    const skip = (current - 1) * (pageSize);
    const result = await this.userModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .select("-password")
      .sort(sort as any)
    return { result, totalPage };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findUserByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateMany({ _id: updateUserDto._id }, { ...updateUserDto });
  }

  async remove(_id: string) {
    if (mongoose.isValidObjectId(_id)) {
      return this.userModel.deleteOne({ _id });
    } else {
      throw new BadRequestException("Invalid id");
    }
  }
  async handleRegister(createAuthDto: CreateAuthDto) {
    const { name, username, password } = createAuthDto;
    const codeId = uuidv4();
    //check email
    const existsEmail = await this.isExistingEmail(username);
    if (existsEmail) {
      throw new BadRequestException(`Email ${username} is existing, please using another email`);
    }
    //hash password
    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      name, username, password: hashPassword,
      isActive: false,
      codeId: codeId,
      codeExpired: dayjs().add(30, 'minutes'),
    });

    this.mailerService.sendMail({
      to: username, // list of receivers
      from: 'noreply@nestjs.com', // sender address
      subject: 'Activate your account ✔', // Subject line
      template: "register",
      context: {
        name: user?.name ?? user?.email,
        activationCode: codeId
      }
    })
    return {
      _id: user._id
    };
  }
}
