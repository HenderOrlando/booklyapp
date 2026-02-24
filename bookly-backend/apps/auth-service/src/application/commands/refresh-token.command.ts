/**
 * Command para renovar access token usando refresh token
 */
export class RefreshTokenCommand {
  constructor(public readonly refreshToken: string) {}
}
