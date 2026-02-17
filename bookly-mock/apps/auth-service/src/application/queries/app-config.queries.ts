/**
 * CQRS Queries for AppConfiguration
 */

export class GetAppConfigQuery {
  constructor(public readonly includeSecrets: boolean = false) {}
}

export class GetPublicAppConfigQuery {}

export class GetStorageConfigQuery {}
