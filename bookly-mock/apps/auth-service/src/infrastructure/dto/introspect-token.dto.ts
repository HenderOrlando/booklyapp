import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

/**
 * DTO for token introspection request.
 * Used by other microservices to resolve user identity from a JWT.
 */
export class IntrospectTokenDto {
  @ApiProperty({
    description: "JWT access token to introspect",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
