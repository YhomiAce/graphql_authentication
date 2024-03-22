import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UserType } from '../../common/types/User';
import { RegisterInput } from '../../common/dtos/RegisterInput';
import { LoginResponse } from '../../common/types/LoginResponse';
import { LoginInput } from '../../common/dtos/LoginInput';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation((returns) => UserType)
  async register(
    @Args('RegisterInput') inputDto: RegisterInput,
  ): Promise<UserType> {
    return await this.authService.register(inputDto);
  }

  @Mutation((returns) => LoginResponse)
  async login(
    @Args('LoginInput') loginInput: LoginInput,
  ): Promise<LoginResponse> {
    return await this.authService.login(loginInput);
  }
}
