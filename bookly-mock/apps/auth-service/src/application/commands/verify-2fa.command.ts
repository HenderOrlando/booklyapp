/**
 * Verify2FACommand
 * Command para verificar código 2FA durante login
 */
export class Verify2FACommand {
  constructor(
    public readonly userId: string,
    public readonly token: string
  ) {}
}
