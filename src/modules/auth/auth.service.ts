import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserType } from 'src/common/types/User';
import { Prisma, User } from '@prisma/client';
import { RegisterInput } from 'src/common/dtos/RegisterInput';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from 'src/common/interface/jwt.payload.interface';
import { LoginResponse } from 'src/common/types/LoginResponse';
import { TokenType } from 'src/common/types/Token';
import { LoginInput } from 'src/common/dtos/LoginInput';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
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
  async register(inputDto: RegisterInput): Promise<UserType> {
    const user = await this.findUserByEmail(inputDto.email);
    if (user) {
      throw new HttpException('User Already Exist', HttpStatus.CONFLICT);
    }
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(inputDto.password, salt);
    const data: Prisma.UserCreateInput = {
      ...inputDto,
      password,
    };
    const newUser = await this.prismaService.user.create({ data });
    return newUser;
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

  /**
   * Validate user password
   *
   * @async
   * @param {string} email
   * @param {string} password
   * @returns {Promise<any>}
   */
  async validateUserCredentials(
    email: string,
    password: string,
  ): Promise<User> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      return null;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return user;
    }
    return null;
  }

  /**
   * Get JWT token
   *
   * @async
   * @param {User} user
   * @returns {TokenType}
   */
  async issueTokens(user: User): Promise<TokenType> {
    const payload: JWTPayload = {
      username: user.email,
      sub: user.id,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_USER_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_USER_ACCESS_TOKEN_EXPIRY',
        ),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_USER_REFERSH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_USER_REFRESH_TOKEN_EXPIRY',
        ),
      }),
    ]);

    return {
      accessToken: `Bearer ${accessToken}`,
      refreshToken: `Bearer ${refreshToken}`,
    };
  }

  /**
   * Login user
   *
   * @async
   * @param {AuthLoginDto} authLoginDto
   * @returns {Promise<JwtTokenWithUserResponse>}
   */
  async login(authLoginDto: LoginInput): Promise<LoginResponse> {
    const { email, password } = authLoginDto;
    let user = await this.validateUserCredentials(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      user: this.mapPrismaUserTouserType(user) as UserType,
      token: await this.issueTokens(user),
    };
  }
}
