import { IEvent } from "@nestjs/cqrs";

/**
 * Evento emitido cuando se recibe callback OAuth con código
 */
export class OAuthCallbackReceivedEvent implements IEvent {
  constructor(
    public readonly userId: string,
    public readonly provider: string,
    public readonly code: string,
    public readonly state: string,
    public readonly redirectUri: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
