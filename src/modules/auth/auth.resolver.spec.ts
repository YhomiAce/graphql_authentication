import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { UserType } from '../../common/types/User';
import { TokenType } from '../../common/types/Token';
import { LoginResponse } from '../../common/types/LoginResponse';

describe('AuthResolver', () => {
  let resolver: AuthResolver;

  const inputDto = {
    email: 'mock@test.com',
    password: '12345',
  };

  const userMock: UserType = {
    id: Date.now(),
    email: inputDto.email,
    password: "xvvxbxmhssx",
    biometricKey: "xvvxbxmhssx",
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const tokenMock: TokenType = {
    accessToken:"Bearer access_token",
    refreshToken:"Bearer refresh_token",
  }

  const loginResponse: LoginResponse = {
    user: userMock,
    token: tokenMock
  }

  const authServiceMock = {
    register: jest.fn().mockResolvedValue(userMock),
    login: jest.fn().mockResolvedValue(loginResponse)
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthResolver, AuthService],
    })
      .overrideProvider(AuthService)
      .useValue(authServiceMock)
      .compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should create a new user', async () => {
    const result = await resolver.register(inputDto);
    expect(result.id).toEqual(userMock.id);
    expect(result.email).toEqual(userMock.email);
    expect(authServiceMock.register).toHaveBeenCalledWith(inputDto);
  });

  it('should generate acess token and refresh token', async () => {
    const result = await resolver.login(inputDto);
    expect(result.user.id).toEqual(userMock.id);
    expect(result.user.email).toEqual(userMock.email);
    expect(authServiceMock.login).toHaveBeenCalledWith(inputDto);
  });
});
