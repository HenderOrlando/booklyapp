import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { verify } from "jsonwebtoken";

/**
 * WebSocket JWT Authentication Guard
 * Validates JWT token in WebSocket connections
 * 
 * Token can be sent in:
 * 1. socket.handshake.auth.token
 * 2. socket.handshake.query.token
 * 3. socket.handshake.headers.authorization (Bearer token)
 */
@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    try {
      const client = context.switchToWs().getClient();
      const token = this.extractToken(client);

      if (!token) {
        throw new WsException("No token provided");
      }

      // Validate token
      const secret = process.env.JWT_SECRET || "default-secret-key";
      const payload = verify(token, secret);

      // Attach payload to client for later use
      client.user = payload;

      return true;
    } catch (error) {
      throw new WsException("Invalid token");
    }
  }

  private extractToken(client: any): string | null {
    // Try auth object
    if (client.handshake?.auth?.token) {
      return client.handshake.auth.token;
    }

    // Try query string
    if (client.handshake?.query?.token) {
      return client.handshake.query.token;
    }

    // Try Authorization header
    const authHeader = client.handshake?.headers?.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    return null;
  }
}
