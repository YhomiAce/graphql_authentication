import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TokenType {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;
}
