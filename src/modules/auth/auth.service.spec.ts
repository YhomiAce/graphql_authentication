import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { biometricInput, inputDto, loginResponse, userMock } from './__mocks__/user.mock';
import * as bcrypt from 'bcrypt';
import { HttpException, UnauthorizedException } from '@nestjs/common';
import { LoginInput } from '../../common/dtos/LoginInput';

const mockPrismaService = {
  user: {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(userMock),
  },
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue(''),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: JwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should not find user by email', async () => {
      const result = await service.findUserByEmail(inputDto.email);
      expect(result).toBeNull();
    });

    it('should register a new user and return the user', async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(inputDto.password, salt);
      const expectedUser = { ...userMock, password: hashedPassword };
      jest.spyOn(mockPrismaService.user, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(mockPrismaService.user, 'create')
        .mockResolvedValue(expectedUser);

      const result = await service.register(inputDto);

      expect(result).toEqual(expectedUser);
    });

    it('should throw HttpException if user already exists', async () => {
      jest.spyOn(mockPrismaService.user, 'findUnique').mockResolvedValue({});

      await expect(service.register(inputDto)).rejects.toThrow(HttpException);
    });
  });

  describe('login', () => {
    it('should successfully log in a user', async () => {
      jest
        .spyOn(service, 'validateUserCredentials')
        .mockResolvedValue(userMock);
      jest.spyOn(service, 'issueTokens').mockResolvedValue(loginResponse.token);

      const result = await service.login(inputDto);

      expect(result.user).toEqual({
        id: userMock.id,
        email: userMock.email,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(result.token.accessToken).toBe(loginResponse.token.accessToken);
      expect(result.token.refreshToken).toBe(loginResponse.token.refreshToken);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const inputDto: LoginInput = {
        email: 'invalid@example.com',
        password: 'invalidpassword',
      };

      jest.spyOn(service, 'validateUserCredentials').mockResolvedValue(null);

      await expect(service.login(inputDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('BiometricLogin', () => {
    it('should successfully log in a user', async () => {
      jest
        .spyOn(mockPrismaService.user, 'findUnique')
        .mockResolvedValue(userMock);
      jest.spyOn(service, 'issueTokens').mockResolvedValue(loginResponse.token);

      const result = await service.biometricLogin(biometricInput);

      expect(result.user).toEqual({
        id: userMock.id,
        email: userMock.email,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(result.token.accessToken).toBe(loginResponse.token.accessToken);
      expect(result.token.refreshToken).toBe(loginResponse.token.refreshToken);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const inputDto = {
        biometricKey: 'xvvxbxmhssxyyydhd'
      };

      jest.spyOn(mockPrismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.biometricLogin(inputDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
