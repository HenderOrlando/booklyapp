import { createLogger } from "@libs/common";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  CalendarConnection,
  CalendarConnectionDocument,
} from "@availability/infrastructure/schemas/calendar-connection.schema";

const logger = createLogger("ExternalCalendarService");

/**
 * Proveedores de calendario soportados
 */
export enum CalendarProvider {
  GOOGLE = "google",
  OUTLOOK = "outlook",
}

/**
 * Resultado de la conexión OAuth
 */
export interface CalendarConnectionResult {
  connectionId: string;
  provider: CalendarProvider;
  externalEmail: string;
  calendarId: string;
  connectedAt: Date;
}

/**
 * Evento externo importado
 */
export interface ExternalCalendarEvent {
  externalEventId: string;
  provider: CalendarProvider;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  status: "confirmed" | "tentative" | "cancelled";
  organizer?: string;
  attendees?: string[];
}

/**
 * Datos para crear/actualizar evento externo
 */
export interface ExternalEventData {
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  attendees?: string[];
}

/**
 * External Calendar Service (RF-08)
 * Servicio para integración bidireccional con calendarios externos (Google Calendar, Outlook)
 *
 * Flujo OAuth:
 * 1. Frontend redirige al usuario a GET /calendar/connect/:provider
 * 2. Provider redirige de vuelta con authorization code
 * 3. Backend intercambia code por tokens y almacena conexión
 * 4. Sync bidireccional habilitada
 */
@Injectable()
export class ExternalCalendarService {
  private readonly googleClientId: string;
  private readonly googleClientSecret: string;
  private readonly googleRedirectUri: string;
  private readonly outlookClientId: string;
  private readonly outlookClientSecret: string;
  private readonly outlookRedirectUri: string;

  constructor(
    @InjectModel(CalendarConnection.name)
    private readonly calendarConnectionModel: Model<CalendarConnectionDocument>,
    private readonly configService: ConfigService,
  ) {
    this.googleClientId = this.configService.get<string>(
      "GOOGLE_CALENDAR_CLIENT_ID",
      "",
    );
    this.googleClientSecret = this.configService.get<string>(
      "GOOGLE_CALENDAR_CLIENT_SECRET",
      "",
    );
    this.googleRedirectUri = this.configService.get<string>(
      "GOOGLE_CALENDAR_REDIRECT_URI",
      "http://localhost:3002/api/calendar/callback/google",
    );
    this.outlookClientId = this.configService.get<string>(
      "OUTLOOK_CALENDAR_CLIENT_ID",
      "",
    );
    this.outlookClientSecret = this.configService.get<string>(
      "OUTLOOK_CALENDAR_CLIENT_SECRET",
      "",
    );
    this.outlookRedirectUri = this.configService.get<string>(
      "OUTLOOK_CALENDAR_REDIRECT_URI",
      "http://localhost:3002/api/calendar/callback/outlook",
    );

    logger.info("ExternalCalendarService initialized", {
      googleConfigured: !!this.googleClientId,
      outlookConfigured: !!this.outlookClientId,
    });
  }

  /**
   * Generar URL de autorización OAuth para el provider
   */
  getAuthorizationUrl(provider: CalendarProvider, userId: string): string {
    const state = Buffer.from(
      JSON.stringify({ userId, provider, ts: Date.now() }),
    ).toString("base64");

    switch (provider) {
      case CalendarProvider.GOOGLE:
        return this.getGoogleAuthUrl(state);
      case CalendarProvider.OUTLOOK:
        return this.getOutlookAuthUrl(state);
      default:
        throw new Error(`Unsupported calendar provider: ${provider}`);
    }
  }

  private getGoogleAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.googleClientId,
      redirect_uri: this.googleRedirectUri,
      response_type: "code",
      scope: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
      access_type: "offline",
      prompt: "consent",
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  private getOutlookAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.outlookClientId,
      redirect_uri: this.outlookRedirectUri,
      response_type: "code",
      scope: [
        "openid",
        "profile",
        "email",
        "Calendars.ReadWrite",
        "offline_access",
      ].join(" "),
      state,
    });

    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
  }

  /**
   * Intercambiar authorization code por tokens y crear conexión
   */
  async handleOAuthCallback(
    provider: CalendarProvider,
    code: string,
    state: string,
  ): Promise<CalendarConnectionResult> {
    const stateData = JSON.parse(
      Buffer.from(state, "base64").toString("utf-8"),
    );
    const userId = stateData.userId;

    logger.info("Processing OAuth callback", { provider, userId });

    let tokens: {
      accessToken: string;
      refreshToken: string;
      expiresAt: Date;
      email: string;
    };

    switch (provider) {
      case CalendarProvider.GOOGLE:
        tokens = await this.exchangeGoogleCode(code);
        break;
      case CalendarProvider.OUTLOOK:
        tokens = await this.exchangeOutlookCode(code);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    const connection = await this.calendarConnectionModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), provider },
      {
        userId: new Types.ObjectId(userId),
        provider,
        externalUserId: tokens.email,
        externalEmail: tokens.email,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
        calendarId: "primary",
        syncEnabled: true,
        syncFromExternal: true,
        syncToExternal: true,
        connectedAt: new Date(),
        isActive: true,
        lastSyncStatus: "connected",
      },
      { upsert: true, new: true },
    );

    logger.info("Calendar connection established", {
      connectionId: connection._id?.toString(),
      provider,
      email: tokens.email,
    });

    return {
      connectionId: connection._id?.toString() || "",
      provider,
      externalEmail: tokens.email,
      calendarId: "primary",
      connectedAt: connection.connectedAt,
    };
  }

  /**
   * Intercambiar code de Google por tokens
   */
  private async exchangeGoogleCode(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    email: string;
  }> {
    const tokenUrl = "https://oauth2.googleapis.com/token";

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: this.googleClientId,
        client_secret: this.googleClientSecret,
        redirect_uri: this.googleRedirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error("Google token exchange failed", new Error(error));
      throw new Error(`Google OAuth token exchange failed: ${error}`);
    }

    const data = (await response.json()) as any;

    // Obtener email del usuario
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${data.access_token}` },
      },
    );

    const userInfo = (await userInfoResponse.json()) as any;

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      email: userInfo.email,
    };
  }

  /**
   * Intercambiar code de Outlook por tokens
   */
  private async exchangeOutlookCode(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    email: string;
  }> {
    const tokenUrl =
      "https://login.microsoftonline.com/common/oauth2/v2.0/token";

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: this.outlookClientId,
        client_secret: this.outlookClientSecret,
        redirect_uri: this.outlookRedirectUri,
        grant_type: "authorization_code",
        scope: "Calendars.ReadWrite offline_access",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error("Outlook token exchange failed", new Error(error));
      throw new Error(`Outlook OAuth token exchange failed: ${error}`);
    }

    const data = (await response.json()) as any;

    // Obtener email del usuario via Microsoft Graph
    const meResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });

    const meData = (await meResponse.json()) as any;

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      email: meData.mail || meData.userPrincipalName,
    };
  }

  /**
   * Refrescar token de acceso
   */
  async refreshAccessToken(
    connectionId: string,
  ): Promise<{ accessToken: string; expiresAt: Date }> {
    const connection = await this.calendarConnectionModel.findById(connectionId);

    if (!connection) {
      throw new NotFoundException(`Calendar connection ${connectionId} not found`);
    }

    let newTokens: { accessToken: string; expiresAt: Date };

    switch (connection.provider) {
      case CalendarProvider.GOOGLE:
        newTokens = await this.refreshGoogleToken(connection.refreshToken);
        break;
      case CalendarProvider.OUTLOOK:
        newTokens = await this.refreshOutlookToken(connection.refreshToken);
        break;
      default:
        throw new Error(`Unsupported provider: ${connection.provider}`);
    }

    await this.calendarConnectionModel.findByIdAndUpdate(connectionId, {
      accessToken: newTokens.accessToken,
      tokenExpiresAt: newTokens.expiresAt,
    });

    return newTokens;
  }

  private async refreshGoogleToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; expiresAt: Date }> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: this.googleClientId,
        client_secret: this.googleClientSecret,
        grant_type: "refresh_token",
      }),
    });

    const data = (await response.json()) as any;
    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  private async refreshOutlookToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; expiresAt: Date }> {
    const response = await fetch(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: this.outlookClientId,
          client_secret: this.outlookClientSecret,
          grant_type: "refresh_token",
          scope: "Calendars.ReadWrite offline_access",
        }),
      },
    );

    const data = (await response.json()) as any;
    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  /**
   * Obtener token válido (refresh si expirado)
   */
  private async getValidAccessToken(connectionId: string): Promise<string> {
    const connection = await this.calendarConnectionModel.findById(connectionId);

    if (!connection) {
      throw new NotFoundException(`Calendar connection not found`);
    }

    if (connection.tokenExpiresAt < new Date()) {
      const refreshed = await this.refreshAccessToken(connectionId);
      return refreshed.accessToken;
    }

    return connection.accessToken;
  }

  /**
   * Crear evento en calendario externo cuando se confirma una reserva
   */
  async createExternalEvent(
    userId: string,
    eventData: ExternalEventData,
  ): Promise<{ google?: string; outlook?: string }> {
    const connections = await this.calendarConnectionModel.find({
      userId: new Types.ObjectId(userId),
      isActive: true,
      syncToExternal: true,
    });

    const result: { google?: string; outlook?: string } = {};

    for (const connection of connections) {
      try {
        const accessToken = await this.getValidAccessToken(
          connection._id!.toString(),
        );

        switch (connection.provider) {
          case CalendarProvider.GOOGLE:
            result.google = await this.createGoogleEvent(
              accessToken,
              eventData,
            );
            break;
          case CalendarProvider.OUTLOOK:
            result.outlook = await this.createOutlookEvent(
              accessToken,
              eventData,
            );
            break;
        }

        await this.calendarConnectionModel.findByIdAndUpdate(connection._id, {
          lastSyncAt: new Date(),
          lastSyncStatus: "success",
        });
      } catch (error: any) {
        logger.error(
          `Failed to create event on ${connection.provider}`,
          error,
        );
        await this.calendarConnectionModel.findByIdAndUpdate(connection._id, {
          lastSyncStatus: "error",
          $push: { syncErrors: error.message },
        });
      }
    }

    return result;
  }

  private async createGoogleEvent(
    accessToken: string,
    eventData: ExternalEventData,
  ): Promise<string> {
    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: eventData.title,
          description: eventData.description,
          location: eventData.location,
          start: {
            dateTime: eventData.startTime.toISOString(),
            timeZone: "America/Bogota",
          },
          end: {
            dateTime: eventData.endTime.toISOString(),
            timeZone: "America/Bogota",
          },
          attendees: eventData.attendees?.map((email) => ({ email })),
        }),
      },
    );

    const data = (await response.json()) as any;
    return data.id;
  }

  private async createOutlookEvent(
    accessToken: string,
    eventData: ExternalEventData,
  ): Promise<string> {
    const response = await fetch(
      "https://graph.microsoft.com/v1.0/me/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: eventData.title,
          body: {
            contentType: "Text",
            content: eventData.description || "",
          },
          start: {
            dateTime: eventData.startTime.toISOString(),
            timeZone: "America/Bogota",
          },
          end: {
            dateTime: eventData.endTime.toISOString(),
            timeZone: "America/Bogota",
          },
          location: { displayName: eventData.location },
          attendees: eventData.attendees?.map((email) => ({
            emailAddress: { address: email },
            type: "required",
          })),
        }),
      },
    );

    const data = (await response.json()) as any;
    return data.id;
  }

  /**
   * Importar eventos externos del calendario del usuario
   */
  async importExternalEvents(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ExternalCalendarEvent[]> {
    const connections = await this.calendarConnectionModel.find({
      userId: new Types.ObjectId(userId),
      isActive: true,
      syncFromExternal: true,
    });

    const allEvents: ExternalCalendarEvent[] = [];

    for (const connection of connections) {
      try {
        const accessToken = await this.getValidAccessToken(
          connection._id!.toString(),
        );

        let events: ExternalCalendarEvent[];

        switch (connection.provider) {
          case CalendarProvider.GOOGLE:
            events = await this.fetchGoogleEvents(
              accessToken,
              startDate,
              endDate,
            );
            break;
          case CalendarProvider.OUTLOOK:
            events = await this.fetchOutlookEvents(
              accessToken,
              startDate,
              endDate,
            );
            break;
          default:
            events = [];
        }

        allEvents.push(...events);

        await this.calendarConnectionModel.findByIdAndUpdate(connection._id, {
          lastSyncAt: new Date(),
          lastSyncStatus: "success",
        });
      } catch (error: any) {
        logger.error(
          `Failed to import events from ${connection.provider}`,
          error,
        );
      }
    }

    return allEvents;
  }

  private async fetchGoogleEvents(
    accessToken: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ExternalCalendarEvent[]> {
    const params = new URLSearchParams({
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "100",
    });

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    const data = (await response.json()) as any;

    return (data.items || []).map(
      (item: any): ExternalCalendarEvent => ({
        externalEventId: item.id,
        provider: CalendarProvider.GOOGLE,
        title: item.summary || "Sin título",
        description: item.description,
        location: item.location,
        startTime: new Date(item.start?.dateTime || item.start?.date),
        endTime: new Date(item.end?.dateTime || item.end?.date),
        isAllDay: !!item.start?.date,
        status: item.status === "cancelled" ? "cancelled" : "confirmed",
        organizer: item.organizer?.email,
        attendees: item.attendees?.map((a: any) => a.email),
      }),
    );
  }

  private async fetchOutlookEvents(
    accessToken: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ExternalCalendarEvent[]> {
    const start = startDate.toISOString();
    const end = endDate.toISOString();

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${start}&endDateTime=${end}&$top=100`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    const data = (await response.json()) as any;

    return (data.value || []).map(
      (item: any): ExternalCalendarEvent => ({
        externalEventId: item.id,
        provider: CalendarProvider.OUTLOOK,
        title: item.subject || "Sin título",
        description: item.body?.content,
        location: item.location?.displayName,
        startTime: new Date(item.start?.dateTime),
        endTime: new Date(item.end?.dateTime),
        isAllDay: item.isAllDay || false,
        status: item.isCancelled ? "cancelled" : "confirmed",
        organizer: item.organizer?.emailAddress?.address,
        attendees: item.attendees?.map(
          (a: any) => a.emailAddress?.address,
        ),
      }),
    );
  }

  /**
   * Obtener conexiones activas del usuario
   */
  async getUserConnections(
    userId: string,
  ): Promise<
    Array<{
      id: string;
      provider: string;
      email: string;
      syncEnabled: boolean;
      lastSyncAt?: Date;
      lastSyncStatus?: string;
    }>
  > {
    const connections = await this.calendarConnectionModel
      .find({ userId: new Types.ObjectId(userId), isActive: true })
      .lean();

    return connections.map((c) => ({
      id: c._id?.toString() || "",
      provider: c.provider,
      email: c.externalEmail,
      syncEnabled: c.syncEnabled,
      lastSyncAt: c.lastSyncAt,
      lastSyncStatus: c.lastSyncStatus,
    }));
  }

  /**
   * Desconectar calendario externo
   */
  async disconnect(userId: string, provider: CalendarProvider): Promise<void> {
    await this.calendarConnectionModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), provider },
      {
        isActive: false,
        syncEnabled: false,
        disconnectedAt: new Date(),
      },
    );

    logger.info("Calendar disconnected", { userId, provider });
  }
}
