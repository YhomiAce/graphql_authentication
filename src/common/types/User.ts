import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field((type) => Int)
  id: number;

  @Field()
  email: string;

  @Field({ nullable: true })
  password: string;

  @Field({ nullable: true })
  biometricKey: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
