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
import { v4 as uuid } from 'uuid';
import { BiometricInput } from 'src/common/dtos/BiometricInput';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Find User By email
   *
   * @async
   * @param {string} email
   * @returns {Promise<User | null>}
   */
  async findUserByEmail(email: string): Promise<User | null> {
    // Find a user by the given email
    // extract this to a method as it is used in multiple place
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
   * @returns {Promise<UserType>}
   */
  async register(inputDto: RegisterInput): Promise<UserType> {
    // check if the email is already registered
    const user = await this.findUserByEmail(inputDto.email);

    // Throw an exception for already used email
    if (user) {
      throw new HttpException('User Already Exist', HttpStatus.CONFLICT);
    }
    // Generate salt to hash password
    const salt = await bcrypt.genSalt(10);

    // hash the password
    const password = await bcrypt.hash(inputDto.password, salt);

    // create user and generate unique uuid for user biometric(simulating)
    const data: Prisma.UserCreateInput = {
      ...inputDto,
      password,
      biometricKey: uuid(),
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
   * @returns {Promise<User>}
   */
  async validateUserCredentials(
    email: string,
    password: string,
  ): Promise<User> {
    // find the user by the email
    const user = await this.findUserByEmail(email);

    // Return null if user is not found
    if (!user) {
      return null;
    }

    // Compare the saved hashed password to the hash of the incoming password
    const isMatch = await bcrypt.compare(password, user.password);

    // return user if password match
    if (isMatch) {
      return user;
    }
    // return null if password do not match
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
    // JWT payload to identify the user
    const payload: JWTPayload = {
      username: user.email,
      sub: user.id,
    };

    // Generate JWT tokens for access and refresh tokens
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

    // Return the tokens
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
   * @returns {Promise<LoginResponse>}
   */
  async login(authLoginDto: LoginInput): Promise<LoginResponse> {
    const { email, password } = authLoginDto;
    // Validate the user credentials
    let user = await this.validateUserCredentials(email, password);
    // throw unauthorized error if the creedential is invalid
    if (!user) {
      throw new UnauthorizedException();
    }
    // Return the user and the access tokens
    return {
      user: this.mapPrismaUserTouserType(user) as UserType,
      token: await this.issueTokens(user),
    };
  }

  /**
   * Biometric Login user
   *
   * @async
   * @param {BiometricInput} inputDto
   * @returns {Promise<LoginResponse>}
   */
  async biometricLogin(inputDto: BiometricInput): Promise<LoginResponse> {
    // find the user with the biometrickey
    const user = await this.prismaService.user.findUnique({
      where: { biometricKey: inputDto.biometricKey },
    });

    // throw unauthorized error if the user is not found
    if (!user) {
      throw new UnauthorizedException();
    }
    // Return the user and the access tokens
    return {
      user: this.mapPrismaUserTouserType(user) as UserType,
      token: await this.issueTokens(user),
    };
  }
}
