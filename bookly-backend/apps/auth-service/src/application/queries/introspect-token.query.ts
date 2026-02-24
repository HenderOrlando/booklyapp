import { IQuery } from "@nestjs/cqrs";

/**
 * Query to introspect a JWT token and resolve the full user identity.
 * Returns user data + roles + permissions from the database (not just JWT claims).
 */
export class IntrospectTokenQuery implements IQuery {
  constructor(public readonly token: string) {}
}
