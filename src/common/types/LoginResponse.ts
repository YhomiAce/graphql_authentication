import { Field, ObjectType } from "@nestjs/graphql";
import { UserType } from "./User";
import { TokenType } from "./Token";

@ObjectType()
export class LoginResponse {
    @Field(type => UserType)
    user: UserType;

    @Field(type => TokenType)
    token: TokenType;
}