import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UserType } from 'src/common/types/User';
import { RegisterInput } from 'src/common/dtos/RegisterInput';

@Resolver()
export class AuthResolver {
    constructor(
        private readonly authService: AuthService
    ){}

   
    @Mutation(returns => UserType)
    async register(@Args("RegisterInput") inputDto: RegisterInput) {
        return await this.authService.register(inputDto);
    }
}
