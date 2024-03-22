import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UserType } from '../../common/types/User';
import { RegisterInput } from '../../common/dtos/RegisterInput';
import { LoginResponse } from '../../common/types/LoginResponse';
import { LoginInput } from '../../common/dtos/LoginInput';
import { BiometricInput } from '../../common/dtos/BiometricInput';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register
   *
   * @async
   * @param {RegisterInput} inputDto
   * @returns {Promise<UserType>}
   */
  @Mutation(() => UserType)
  async register(
    @Args('RegisterInput') inputDto: RegisterInput,
  ): Promise<UserType> {
    return await this.authService.register(inputDto);
  }

  /**
   * Login
   *
   * @async
   * @param {LoginInput} loginInput
   * @returns {Promise<LoginResponse>}
   */
  @Mutation(() => LoginResponse)
  async login(
    @Args('LoginInput') loginInput: LoginInput,
  ): Promise<LoginResponse> {
    return await this.authService.login(loginInput);
  }

  /**
   * Biometric Login
   *
   * @async
   * @param {BiometricInput} inputDto
   * @returns {Promise<LoginResponse>}
   */
  @Mutation(() => LoginResponse, { name: 'biometricLogin' })
  async biometricLogin(
    @Args('BiometricInput') inputDto: BiometricInput,
  ): Promise<LoginResponse> {
    return await this.authService.biometricLogin(inputDto);
  }
}
