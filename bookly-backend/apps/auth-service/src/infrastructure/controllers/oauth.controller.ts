import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";

/**
 * OAuth Controller
 * Controlador para autenticación SSO con proveedores externos
 */
@ApiTags("OAuth / SSO")
@Controller("auth/oauth")
export class OAuthController {
  /**
   * Iniciar flujo de autenticación con Google
   */
  @Get("google")
  @UseGuards(AuthGuard("google"))
  @ApiOperation({
    summary: "Iniciar autenticación con Google Workspace",
    description:
      "Redirige al usuario a Google para autenticación OAuth2. Solo usuarios con dominio @ufps.edu.co pueden autenticarse.",
  })
  @ApiResponse({
    status: 302,
    description: "Redirección a Google OAuth",
  })
  async googleAuth(@Req() req: Request) {
    // Guard redirige automáticamente a Google
  }

  /**
   * Callback de Google OAuth2
   */
  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Callback de Google OAuth2",
    description:
      "Endpoint de callback después de autenticación exitosa con Google. Genera tokens JWT y redirige al frontend.",
  })
  @ApiResponse({
    status: 200,
    description: "Autenticación exitosa",
    schema: {
      example: {
        success: true,
        data: {
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        },
        message: "Autenticación SSO exitosa",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Autenticación fallida o dominio no permitido",
  })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    // El usuario ya fue validado por GoogleStrategy
    const tokens = req.user as any;

    // Opción 1: Redirigir al frontend con tokens en query params (para desarrollo)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;

    // Opción 2: Retornar JSON (comentar la redirección si prefieres esta opción)
    // return ResponseUtil.success(tokens, "Autenticación SSO exitosa");

    // Redirigir al frontend
    res.redirect(redirectUrl);
  }
}
