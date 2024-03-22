import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { userMock, loginResponse, inputDto, biometricInput } from './__mocks__/user.mock';

describe('AuthResolver', () => {
  let resolver: AuthResolver;


  const authServiceMock = {
    register: jest.fn().mockResolvedValue(userMock),
    login: jest.fn().mockResolvedValue(loginResponse),
    biometricLogin: jest.fn().mockResolvedValue(loginResponse)
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

  it('should login user and generate acess token and refresh token', async () => {
    const result = await resolver.login(inputDto);
    expect(result.user.id).toEqual(userMock.id);
    expect(result.user.email).toEqual(userMock.email);
    expect(authServiceMock.login).toHaveBeenCalledWith(inputDto);
  });

  it('should use biometric login and generate acess token and refresh token', async () => {
    const result = await resolver.biometricLogin(biometricInput);
    expect(result.user.id).toEqual(userMock.id);
    expect(result.user.email).toEqual(userMock.email);
    expect(authServiceMock.biometricLogin).toHaveBeenCalledWith(biometricInput);
  });
});
