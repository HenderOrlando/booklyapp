/**
 * Query para validar token JWT
 */
export class ValidateTokenQuery {
  constructor(public readonly token: string) {}
}
