import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UserType } from 'src/common/types/User';
import { RegisterInput } from 'src/common/dtos/RegisterInput';
import { LoginResponse } from 'src/common/types/LoginResponse';
import { LoginInput } from 'src/common/dtos/LoginInput';

@Resolver()
export class AuthResolver {
    constructor(
        private readonly authService: AuthService
    ){}

   
    @Mutation(returns => UserType)
    async register(@Args("RegisterInput") inputDto: RegisterInput) {
        return await this.authService.register(inputDto);
    }
   
    @Mutation(returns => LoginResponse)
    async login(@Args("LoginInput") loginInput: LoginInput) {
        return await this.authService.login(loginInput);
    }
}
