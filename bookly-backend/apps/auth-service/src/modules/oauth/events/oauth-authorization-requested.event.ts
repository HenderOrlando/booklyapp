import { IEvent } from "@nestjs/cqrs";

/**
 * Evento emitido cuando se solicita autorización OAuth
 */
export class OAuthAuthorizationRequestedEvent implements IEvent {
  constructor(
    public readonly userId: string,
    public readonly provider: string, // 'google' | 'microsoft'
    public readonly purpose: string, // 'sso' | 'calendar'
    public readonly redirectUri: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
