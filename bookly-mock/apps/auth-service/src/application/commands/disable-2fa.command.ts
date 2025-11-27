/**
 * Disable2FACommand
 * Command para deshabilitar 2FA
 */
export class Disable2FACommand {
  constructor(public readonly userId: string) {}
}
