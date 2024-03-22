import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator";

@InputType()
export class BiometricInput {
    @Field()
    @IsNotEmpty()
    @IsString()
    biometricKey: string;
}