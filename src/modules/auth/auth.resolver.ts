import { Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
    constructor(
        private readonly authService: AuthService
    ){}

    @Query((returns) => String)
    hello(){
        return "Hello";
    }
}
