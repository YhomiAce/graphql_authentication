import { LoginResponse } from "../../../common/types/LoginResponse";
import { TokenType } from "../../../common/types/Token";
import { UserType } from "../../../common/types/User";

export const inputDto = {
  email: 'mock@test.com',
  password: '12345',
};

export const biometricInput = {
    biometricKey: 'xvvxbxmhssx',
}

export const userMock: UserType = {
  id: Date.now(),
  email: inputDto.email,
  password: 'xvvxbxmhssx',
  biometricKey: 'xvvxbxmhssx',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const tokenMock: TokenType = {
  accessToken: 'Bearer access_token',
  refreshToken: 'Bearer refresh_token',
};

export const loginResponse: LoginResponse = {
  user: userMock,
  token: tokenMock,
};
