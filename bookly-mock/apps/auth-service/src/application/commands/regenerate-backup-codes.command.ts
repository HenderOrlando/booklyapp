/**
 * RegenerateBackupCodesCommand
 * Command para regenerar códigos de backup 2FA
 */
export class RegenerateBackupCodesCommand {
  constructor(public readonly userId: string) {}
}
