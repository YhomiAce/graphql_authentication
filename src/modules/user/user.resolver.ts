import { Query, Resolver } from '@nestjs/graphql';
import { UserType } from 'src/common/types/User';

@Resolver()
export class UserResolver {
  @Query((returns) => UserType, { name: 'user' })
  getUser() {}
}
