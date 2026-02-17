import { IQuery } from "@nestjs/cqrs";

/**
 * Query to evaluate if a user has permission to perform an action on a resource.
 * Resolves from DB (not JWT claims) for authoritative RBAC checks.
 */
export class EvaluatePermissionsQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly resource: string,
    public readonly action: string,
    public readonly context?: Record<string, any>,
  ) {}
}
