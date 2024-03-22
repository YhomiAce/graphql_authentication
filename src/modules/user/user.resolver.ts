import { UseGuards } from '@nestjs/common';
import { Context, Query, Resolver } from '@nestjs/graphql';
import { UserType } from '../../common/types/User';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';

@Resolver()
export class UserResolver {
  @Query((returns) => UserType, { name: 'user' })
  @UseGuards(AccessTokenGuard)
  getUser(@Context() ctx) {
    return ctx.req.user;
  }
}
