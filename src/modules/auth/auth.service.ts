import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserType } from 'src/common/types/User';
import { Prisma, User } from '@prisma/client';
import { RegisterInput } from 'src/common/dtos/RegisterInput';
import { ConfigService } from '@nestjs/config';
import * as bcrpt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Find User
   *
   * @async
   * @param {string} email
   * @returns {Promise<User | null>}
   */
  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }
    return user;
  }

  /**
   * Register
   *
   * @async
   * @param {RegisterInput} inputDto
   * @returns {Promise<Partial<UserType>>}
   */
  async register(inputDto: RegisterInput): Promise<Partial<UserType>> {
    const user = await this.findUserByEmail(inputDto.email);
    if (user) {
      throw new HttpException('User Already Exist', HttpStatus.CONFLICT);
    }
    const salt = await bcrpt.genSalt(10);
    const password = await bcrpt.hash(inputDto.password, salt);
    const data: Prisma.UserCreateInput = {
      ...inputDto,
      password,
    };
    const newUser = await this.prismaService.user.create({ data });
    return this.mapPrismaUserTouserType(newUser);
  }

  /**
   * Map DB User to UserType schema
   *
   * @async
   * @param {User} user
   * @returns {Partial<UserType>}
   */
  mapPrismaUserTouserType(user: User): Partial<UserType> {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
