import * as crypto from "crypto";

/**
 * Utilidad para encriptación de tokens OAuth
 * Usa AES-256-CBC para encriptación simétrica
 */
export class TokenEncryptionUtil {
  private static readonly ALGORITHM = "aes-256-cbc";
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;

  /**
   * Encriptar token
   * @param token Token a encriptar
   * @param encryptionKey Clave de encriptación (32 bytes)
   * @returns Token encriptado en formato "iv:encrypted"
   */
  static encrypt(token: string, encryptionKey: string): string {
    const key = this.prepareKey(encryptionKey);
    const iv = crypto.randomBytes(this.IV_LENGTH);

    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    let encrypted = cipher.update(token, "utf8", "hex");
    encrypted += cipher.final("hex");

    return `${iv.toString("hex")}:${encrypted}`;
  }

  /**
   * Desencriptar token
   * @param encryptedToken Token encriptado en formato "iv:encrypted"
   * @param encryptionKey Clave de encriptación (32 bytes)
   * @returns Token desencriptado
   */
  static decrypt(encryptedToken: string, encryptionKey: string): string {
    const key = this.prepareKey(encryptionKey);

    const [ivHex, encrypted] = encryptedToken.split(":");
    const iv = Buffer.from(ivHex, "hex");

    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  /**
   * Generar clave de encriptación aleatoria
   * @returns Clave de 32 bytes en formato hex
   */
  static generateEncryptionKey(): string {
    return crypto.randomBytes(this.KEY_LENGTH).toString("hex");
  }

  /**
   * Hash de token (para comparación sin revelar el valor)
   * @param token Token a hashear
   * @returns Hash SHA-256 del token
   */
  static hash(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Preparar clave de encriptación (asegurar 32 bytes)
   */
  private static prepareKey(encryptionKey: string): Buffer {
    return Buffer.from(encryptionKey, "utf8").slice(0, this.KEY_LENGTH);
  }

  /**
   * Generar state para CSRF protection
   * @returns State aleatorio de 32 bytes en hex
   */
  static generateState(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Generar code verifier para PKCE
   * @returns Code verifier aleatorio
   */
  static generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString("base64url");
  }

  /**
   * Generar code challenge desde code verifier (PKCE)
   * @param codeVerifier Code verifier
   * @returns Code challenge SHA-256
   */
  static generateCodeChallenge(codeVerifier: string): string {
    return crypto.createHash("sha256").update(codeVerifier).digest("base64url");
  }
}
