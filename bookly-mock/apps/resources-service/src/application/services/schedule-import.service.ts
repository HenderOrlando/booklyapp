import { ImportResourceMode, ResourceType } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { ResourceEntity } from "@resources/domain/entities/resource.entity";
import { ICategoryRepository } from "@resources/domain/repositories/category.repository.interface";
import { IResourceRepository } from "@resources/domain/repositories/resource.repository.interface";
import { IProgramRepository, ProgramEntity } from "@resources/domain/repositories/program.repository.interface";
import {
  ImportScheduleResponseDto,
  ScheduleImportResourceResultDto,
  ScheduleImportReservationResultDto,
  ScheduleImportTeacherResultDto,
} from "@resources/infrastructure/dto/import-schedule.dto";

/**
 * Fila parseada del CSV de horarios institucionales
 */
export interface ParsedScheduleRow {
  recurso: string;
  edificio: string;
  capacidad: string;
  dia: string;
  hora: string;
  programa: string;
  materia: string;
  docente: string;
  estudiantes: string;
  title_original: string;
  // Campos extraídos del title_original
  parsedCarrera?: string;
  parsedMateria?: string;
  parsedDocente?: string;
  parsedAlumnos?: string;
}

/**
 * Recurso agrupado con sus horarios
 */
interface GroupedResource {
  code: string;
  building: string;
  capacity: number;
  description: string;
  programCodes: Set<string>;
  schedules: Array<{
    day: string;
    startTime: string;
    endTime: string;
    materia: string;
    docente: string;
    programa: string;
    estudiantes: number;
    carrera: string;
  }>;
}

/**
 * Resultado de resolución de docente
 */
export interface ResolvedTeacher {
  fullName: string;
  email: string;
  userId: string;
  created: boolean;
}

/**
 * Resultado de reserva creada
 */
export interface CreatedReservation {
  resourceCode: string;
  schedule: string;
  purpose: string;
  teacherName: string;
  isRecurring: boolean;
  seriesId?: string;
  reservationId?: string;
}

/**
 * Interfaz para el cliente HTTP de auth-service (resolución de docentes)
 */
export interface IAuthServiceClient {
  findOrCreateTeacher(params: {
    fullName: string;
    email: string;
    role: string;
    tenantId: string;
    createdBy: string;
  }): Promise<{ userId: string; created: boolean }>;
}

/**
 * Interfaz para el cliente HTTP de availability-service (creación de reservas)
 */
export interface IAvailabilityServiceClient {
  createRecurringReservation(params: {
    resourceId: string;
    userId: string;
    startDate: string;
    endDate: string;
    purpose: string;
    recurrencePattern: {
      frequency: string;
      interval: number;
      endDate: string;
      daysOfWeek: number[];
    };
    notes?: string;
    createdBy: string;
  }): Promise<{ seriesId: string; instanceCount: number }>;

  createReservation(params: {
    resourceId: string;
    userId: string;
    startDate: string;
    endDate: string;
    purpose: string;
    notes?: string;
    createdBy: string;
  }): Promise<{ reservationId: string }>;
}

/**
 * Mapa de días en español a número de día de semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
 */
const DAY_MAP: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  miércoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
  sábado: 6,
};

/**
 * Schedule Import Service
 * Servicio para importar horarios institucionales desde CSV
 * Crea recursos, resuelve docentes y genera reservas recurrentes
 */
@Injectable()
export class ScheduleImportService {
  private readonly logger = createLogger("ScheduleImportService");

  constructor(
    private readonly resourceRepository: IResourceRepository,
    private readonly categoryRepository: ICategoryRepository,
    private readonly programRepository: IProgramRepository,
    private readonly authServiceClient: IAuthServiceClient,
    private readonly availabilityServiceClient: IAvailabilityServiceClient
  ) {}

  /**
   * Importar horarios completos desde CSV institucional
   */
  async importScheduleFromCSV(params: {
    csvContent: string;
    resourceType: ResourceType;
    recurrenceStartDate: string;
    recurrenceEndDate: string;
    userId: string;
    mode: ImportResourceMode;
    skipErrors: boolean;
    defaultCategoryCodes?: string[];
    defaultTeacherRole?: string;
    institutionalEmailDomain?: string;
  }): Promise<ImportScheduleResponseDto> {
    const startTime = Date.now();

    this.logger.info("Starting schedule import from CSV", {
      resourceType: params.resourceType,
      mode: params.mode,
      recurrenceStartDate: params.recurrenceStartDate,
      recurrenceEndDate: params.recurrenceEndDate,
    });

    const errors: Array<{ row: number; resourceCode?: string; error: string }> =
      [];
    const warnings: Array<{
      row: number;
      resourceCode?: string;
      warning: string;
    }> = [];
    const resourceResults: ScheduleImportResourceResultDto[] = [];
    const reservationResults: ScheduleImportReservationResultDto[] = [];
    const teacherResults: ScheduleImportTeacherResultDto[] = [];
    const teacherCache = new Map<string, ResolvedTeacher>();
    const resourceCache = new Map<string, { id: string; created: boolean }>();

    // 1. Parse CSV
    const rows = this.parseScheduleCSV(params.csvContent);
    const totalRows = rows.length;

    this.logger.info(`Parsed ${totalRows} rows from CSV`);

    // 2. Agrupar por recurso
    const groupedResources = this.groupByResource(rows);
    this.logger.info(
      `Found ${groupedResources.size} unique resources to process`
    );

    // 3. Resolver categorías default
    const categoryIds = await this.resolveCategoryIds(
      params.defaultCategoryCodes || []
    );

    // 4. Procesar cada recurso agrupado
    for (const [resourceCode, grouped] of groupedResources) {
      try {
        // 4a. Crear/actualizar recurso
        const resourceResult = await this.processResource(
          grouped,
          params.resourceType,
          categoryIds,
          params.mode,
          params.userId
        );

        resourceCache.set(resourceCode, resourceResult);
        resourceResults.push({
          code: resourceCode,
          resourceId: resourceResult.id,
          created: resourceResult.created,
        });

        // 4b. Procesar cada horario del recurso
        for (const schedule of grouped.schedules) {
          try {
            // Resolver docente
            let resolvedTeacher: ResolvedTeacher | null = null;
            const docenteName = schedule.docente.trim();

            if (
              docenteName &&
              docenteName.toLowerCase() !== "no especificado"
            ) {
              if (teacherCache.has(docenteName)) {
                resolvedTeacher = teacherCache.get(docenteName)!;
              } else {
                resolvedTeacher = await this.resolveTeacher(
                  docenteName,
                  params.defaultTeacherRole || "TEACHER",
                  params.institutionalEmailDomain || "ufps.edu.co",
                  params.userId
                );
                teacherCache.set(docenteName, resolvedTeacher);
                teacherResults.push({
                  fullName: resolvedTeacher.fullName,
                  email: resolvedTeacher.email,
                  userId: resolvedTeacher.userId,
                  created: resolvedTeacher.created,
                });
              }
            } else {
              warnings.push({
                row: 0,
                resourceCode,
                warning: `Docente no especificado para ${schedule.materia} en ${resourceCode}. Reserva se crea con el usuario importador.`,
              });
            }

            // Crear reserva
            const reservationResult = await this.createScheduleReservation({
              resourceId: resourceResult.id,
              resourceCode,
              schedule,
              teacherUserId: resolvedTeacher?.userId || params.userId,
              teacherName: resolvedTeacher?.fullName || "Importador",
              recurrenceStartDate: params.recurrenceStartDate,
              recurrenceEndDate: params.recurrenceEndDate,
              createdBy: params.userId,
            });

            reservationResults.push(reservationResult);
          } catch (scheduleError) {
            const errorMsg =
              scheduleError instanceof Error
                ? scheduleError.message
                : String(scheduleError);
            errors.push({
              row: 0,
              resourceCode,
              error: `Error creating reservation for ${schedule.materia} (${schedule.day} ${schedule.startTime}-${schedule.endTime}): ${errorMsg}`,
            });

            if (!params.skipErrors) {
              throw new Error(
                `Schedule import failed for ${resourceCode}: ${errorMsg}`
              );
            }
          }
        }
      } catch (resourceError) {
        const errorMsg =
          resourceError instanceof Error
            ? resourceError.message
            : String(resourceError);
        errors.push({
          row: 0,
          resourceCode,
          error: `Error processing resource ${resourceCode}: ${errorMsg}`,
        });

        if (!params.skipErrors) {
          throw resourceError;
        }
      }
    }

    // 5. Resolver programas
    const uniquePrograms = new Set<string>();
    for (const [, grouped] of groupedResources) {
      for (const code of grouped.programCodes) {
        uniquePrograms.add(code);
      }
    }

    const processingTime = Date.now() - startTime;

    const response: ImportScheduleResponseDto = {
      totalRows,
      resourcesCreated: resourceResults.filter((r) => r.created).length,
      resourcesUpdated: resourceResults.filter((r) => !r.created).length,
      reservationsCreated: reservationResults.length,
      teachersCreated: teacherResults.filter((t) => t.created).length,
      teachersFound: teacherResults.filter((t) => !t.created).length,
      programsResolved: uniquePrograms.size,
      errorCount: errors.length,
      errors,
      warnings,
      resources: resourceResults,
      reservations: reservationResults,
      teachers: teacherResults,
      processingTime,
    };

    this.logger.info("Schedule import completed", {
      totalRows,
      resourcesCreated: response.resourcesCreated,
      resourcesUpdated: response.resourcesUpdated,
      reservationsCreated: response.reservationsCreated,
      teachersCreated: response.teachersCreated,
      errorCount: errors.length,
      processingTime,
    });

    return response;
  }

  /**
   * Parsear CSV de horarios institucionales
   * Maneja campos multiline con comillas (title_original)
   */
  parseScheduleCSV(csvContent: string): ParsedScheduleRow[] {
    const rows: ParsedScheduleRow[] = [];
    const lines = csvContent.split("\n");

    if (lines.length < 2) {
      throw new Error("CSV file is empty or has no data rows");
    }

    // Parse header
    const headerLine = lines[0].trim();
    const headers = this.parseCSVLine(headerLine);

    const headerMap: Record<string, number> = {};
    headers.forEach((h, i) => {
      headerMap[h.toLowerCase().trim()] = i;
    });

    // Validar headers requeridos
    const requiredHeaders = ["recurso", "edificio", "capacidad"];
    for (const required of requiredHeaders) {
      if (!(required in headerMap)) {
        throw new Error(`Missing required header: ${required}`);
      }
    }

    // Parse data rows (manejar multiline dentro de comillas)
    let currentLine = "";
    let insideQuotes = false;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      if (!insideQuotes) {
        currentLine = line;
      } else {
        currentLine += "\n" + line;
      }

      // Contar comillas para detectar si estamos dentro de un campo multiline
      const quoteCount = (currentLine.match(/"/g) || []).length;
      insideQuotes = quoteCount % 2 !== 0;

      if (!insideQuotes && currentLine.trim()) {
        const values = this.parseCSVLine(currentLine);
        const row = this.mapValuesToRow(values, headerMap);

        if (row.recurso) {
          // Extraer datos del title_original
          this.parseTitleOriginal(row);
          rows.push(row);
        }

        currentLine = "";
      }
    }

    return rows;
  }

  /**
   * Parsear una línea CSV respetando comillas
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (insideQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === "," && !insideQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Mapear valores parseados a una fila de horario
   */
  private mapValuesToRow(
    values: string[],
    headerMap: Record<string, number>
  ): ParsedScheduleRow {
    const get = (key: string): string => {
      const idx = headerMap[key];
      return idx !== undefined && idx < values.length
        ? values[idx].trim()
        : "";
    };

    return {
      recurso: get("recurso"),
      edificio: get("edificio"),
      capacidad: get("capacidad"),
      dia: get("dia"),
      hora: get("hora"),
      programa: get("programa"),
      materia: get("materia"),
      docente: get("docente"),
      estudiantes: get("estudiantes"),
      title_original: get("title_original"),
    };
  }

  /**
   * Extraer datos estructurados del campo title_original multiline
   */
  private parseTitleOriginal(row: ParsedScheduleRow): void {
    if (!row.title_original) return;

    const lines = row.title_original.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith("Carrera")) {
        const match = trimmed.match(/Carrera\s*:\s*(.+)/i);
        if (match) row.parsedCarrera = match[1].trim();
      } else if (trimmed.startsWith("Materia")) {
        const match = trimmed.match(/Materia\s*:\s*(.+)/i);
        if (match) row.parsedMateria = match[1].trim();
      } else if (trimmed.startsWith("Docente")) {
        const match = trimmed.match(/Docente\s*:\s*(.+)/i);
        if (match) row.parsedDocente = match[1].trim();
      } else if (trimmed.startsWith("No.Alumnos")) {
        const match = trimmed.match(/No\.Alumnos\s*:\s*(\d+)/i);
        if (match) row.parsedAlumnos = match[1].trim();
      }
    }
  }

  /**
   * Agrupar filas por código de recurso
   */
  private groupByResource(
    rows: ParsedScheduleRow[]
  ): Map<string, GroupedResource> {
    const grouped = new Map<string, GroupedResource>();

    for (const row of rows) {
      const code = row.recurso;

      if (!grouped.has(code)) {
        grouped.set(code, {
          code,
          building: row.edificio,
          capacity: parseInt(row.capacidad, 10) || 0,
          description: row.parsedCarrera || row.title_original || code,
          programCodes: new Set<string>(),
          schedules: [],
        });
      }

      const group = grouped.get(code)!;

      // Agregar programa
      if (row.programa && row.programa !== "No especificado") {
        // Extraer código base del programa (ej: "1155504-C(35)" -> "1155504")
        const programMatch = row.programa.match(/^(\d+)/);
        if (programMatch) {
          group.programCodes.add(programMatch[1]);
        }
        group.programCodes.add(row.programa);
      }

      // Agregar horario
      if (row.dia && row.hora) {
        const [startTime, endTime] = row.hora.split("-");
        group.schedules.push({
          day: row.dia,
          startTime: startTime?.trim() || "",
          endTime: endTime?.trim() || "",
          materia: row.parsedMateria || row.materia || "Sin materia",
          docente: row.parsedDocente || row.docente || "No especificado",
          programa: row.programa,
          estudiantes: parseInt(row.parsedAlumnos || row.estudiantes, 10) || 0,
          carrera: row.parsedCarrera || "",
        });
      }
    }

    return grouped;
  }

  /**
   * Resolver IDs de categorías a partir de códigos
   */
  private async resolveCategoryIds(
    categoryCodes: string[]
  ): Promise<string[]> {
    const ids: string[] = [];

    for (const code of categoryCodes) {
      try {
        const category = await this.categoryRepository.findByCode(code);
        if (category) {
          ids.push(category.id);
        } else {
          this.logger.warn(`Category not found: ${code}`);
        }
      } catch (error) {
        this.logger.warn(`Error resolving category ${code}`, error);
      }
    }

    return ids;
  }

  /**
   * Crear o actualizar un recurso
   */
  private async processResource(
    grouped: GroupedResource,
    resourceType: ResourceType,
    categoryIds: string[],
    mode: ImportResourceMode,
    userId: string
  ): Promise<{ id: string; created: boolean }> {
    const existing = await this.resourceRepository.findByCode(grouped.code);

    // Resolver programas
    const programIds: string[] = [];
    for (const programCode of grouped.programCodes) {
      try {
        const program = await this.programRepository.findByCode(programCode);
        if (program) {
          programIds.push(program.id);
        }
      } catch {
        // Program no existe, se ignora
      }
    }

    // Determinar piso desde el código del recurso (ej: SA401 -> 4, SB402 -> 4)
    const floorMatch = grouped.code.match(/[A-Z]+(\d)/);
    const floor = floorMatch ? floorMatch[1] : undefined;

    if (
      existing &&
      (mode === ImportResourceMode.UPDATE ||
        mode === ImportResourceMode.UPSERT)
    ) {
      // Actualizar
      const updates: Partial<ResourceEntity> = {
        name: grouped.code,
        description: grouped.description,
        type: resourceType,
        capacity: grouped.capacity,
        building: grouped.building,
        floor,
        location: `Edificio ${grouped.building}, Piso ${floor || "N/A"}`,
        programIds:
          programIds.length > 0 ? programIds : existing.programIds,
        updatedAt: new Date(),
      };

      if (categoryIds.length > 0) {
        updates.categoryId = categoryIds[0];
      }

      await this.resourceRepository.update(existing.id, updates);

      this.logger.info("Resource updated from schedule CSV", {
        code: grouped.code,
        resourceId: existing.id,
      });

      return { id: existing.id, created: false };
    } else if (
      !existing &&
      (mode === ImportResourceMode.CREATE ||
        mode === ImportResourceMode.UPSERT)
    ) {
      // Crear
      const resource = new ResourceEntity(
        "", // id will be generated
        grouped.code,
        grouped.code, // name = code
        grouped.description,
        resourceType,
        categoryIds[0] || "",
        grouped.capacity,
        `Edificio ${grouped.building}, Piso ${floor || "N/A"}`,
        floor,
        grouped.building,
        {}, // attributes
        programIds,
        undefined, // status (default)
        true, // isActive
        undefined, // maintenanceSchedule
        {
          requiresApproval: false,
          maxAdvanceBookingDays: 180,
          minBookingDurationMinutes: 30,
          maxBookingDurationMinutes: 720,
          allowRecurring: true,
        }, // availabilityRules
        new Date(),
        new Date(),
        { createdBy: userId, updatedBy: userId }
      );

      const created = await this.resourceRepository.create(resource);

      this.logger.info("Resource created from schedule CSV", {
        code: grouped.code,
        resourceId: created.id,
      });

      return { id: created.id, created: true };
    } else if (existing && mode === ImportResourceMode.CREATE) {
      // Ya existe en modo CREATE → skip, retornar existente
      this.logger.info("Resource already exists, skipping in CREATE mode", {
        code: grouped.code,
      });
      return { id: existing.id, created: false };
    }

    throw new Error(
      `Cannot process resource ${grouped.code} with mode ${mode}`
    );
  }

  /**
   * Resolver o crear un docente en el auth-service
   */
  private async resolveTeacher(
    fullName: string,
    role: string,
    emailDomain: string,
    createdBy: string
  ): Promise<ResolvedTeacher> {
    // Generar email a partir del nombre
    const email = this.generateTeacherEmail(fullName, emailDomain);

    this.logger.info("Resolving teacher", { fullName, email });

    try {
      const result = await this.authServiceClient.findOrCreateTeacher({
        fullName,
        email,
        role,
        tenantId: "UFPS",
        createdBy,
      });

      return {
        fullName,
        email,
        userId: result.userId,
        created: result.created,
      };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error("Error resolving teacher", { fullName, error: errMsg });
      throw new Error(`Cannot resolve teacher "${fullName}": ${errMsg}`);
    }
  }

  /**
   * Generar email institucional a partir del nombre del docente
   * Ej: "REY CASTILLO JONATHAN ROLANDO" -> "jonathan.rey@ufps.edu.co"
   */
  private generateTeacherEmail(fullName: string, domain: string): string {
    const parts = fullName
      .trim()
      .toLowerCase()
      .replace(/[^a-záéíóúñ\s]/gi, "")
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) {
      return `docente.${Date.now()}@${domain}`;
    }

    // Formato UFPS: APELLIDO1 APELLIDO2 NOMBRE1 NOMBRE2
    // Email: nombre1.apellido1@domain
    if (parts.length >= 3) {
      const apellido1 = parts[0];
      const nombre1 = parts[2];
      return `${nombre1}.${apellido1}@${domain}`;
    } else if (parts.length === 2) {
      return `${parts[1]}.${parts[0]}@${domain}`;
    }

    return `${parts[0]}@${domain}`;
  }

  /**
   * Crear una reserva de horario (recurrente si tiene día+hora, única si tiene fecha)
   */
  private async createScheduleReservation(params: {
    resourceId: string;
    resourceCode: string;
    schedule: {
      day: string;
      startTime: string;
      endTime: string;
      materia: string;
      docente: string;
      programa: string;
      estudiantes: number;
      carrera: string;
    };
    teacherUserId: string;
    teacherName: string;
    recurrenceStartDate: string;
    recurrenceEndDate: string;
    createdBy: string;
  }): Promise<CreatedReservation> {
    const { schedule, resourceCode } = params;
    const purpose = `${schedule.materia} - ${schedule.carrera || schedule.programa}`;
    const notes = `Importado desde CSV institucional. Docente: ${schedule.docente}. Estudiantes: ${schedule.estudiantes}`;

    // Determinar si es recurrente (tiene día de la semana) o fecha específica
    const dayNumber = this.parseDayOfWeek(schedule.day);

    if (dayNumber !== null) {
      // Reserva recurrente semanal
      const startDate = this.buildDateTimeISO(
        params.recurrenceStartDate,
        schedule.startTime
      );
      const endDate = this.buildDateTimeISO(
        params.recurrenceStartDate,
        schedule.endTime
      );

      try {
        const result =
          await this.availabilityServiceClient.createRecurringReservation({
            resourceId: params.resourceId,
            userId: params.teacherUserId,
            startDate,
            endDate,
            purpose,
            recurrencePattern: {
              frequency: "WEEKLY",
              interval: 1,
              endDate: params.recurrenceEndDate,
              daysOfWeek: [dayNumber],
            },
            notes,
            createdBy: params.createdBy,
          });

        return {
          resourceCode,
          schedule: `${schedule.day} ${schedule.startTime}-${schedule.endTime}`,
          purpose,
          teacherName: params.teacherName,
          isRecurring: true,
          seriesId: result.seriesId,
        };
      } catch (error) {
        this.logger.warn(
          "Failed to create recurring reservation, logging as pending",
          {
            resourceCode,
            day: schedule.day,
            time: `${schedule.startTime}-${schedule.endTime}`,
            error:
              error instanceof Error ? error.message : String(error),
          }
        );

        // Retornar resultado parcial (reserva registrada pero pendiente)
        return {
          resourceCode,
          schedule: `${schedule.day} ${schedule.startTime}-${schedule.endTime}`,
          purpose,
          teacherName: params.teacherName,
          isRecurring: true,
        };
      }
    } else {
      // Intentar como fecha específica (formato YYYY-MM-DD o DD/MM/YYYY)
      const specificDate = this.parseSpecificDate(schedule.day);

      if (specificDate) {
        const startDate = this.buildDateTimeISO(
          specificDate,
          schedule.startTime
        );
        const endDate = this.buildDateTimeISO(
          specificDate,
          schedule.endTime
        );

        try {
          const result =
            await this.availabilityServiceClient.createReservation({
              resourceId: params.resourceId,
              userId: params.teacherUserId,
              startDate,
              endDate,
              purpose,
              notes,
              createdBy: params.createdBy,
            });

          return {
            resourceCode,
            schedule: `${schedule.day} ${schedule.startTime}-${schedule.endTime}`,
            purpose,
            teacherName: params.teacherName,
            isRecurring: false,
            reservationId: result.reservationId,
          };
        } catch (error) {
          this.logger.warn("Failed to create single reservation", {
            resourceCode,
            date: schedule.day,
            error:
              error instanceof Error ? error.message : String(error),
          });

          return {
            resourceCode,
            schedule: `${schedule.day} ${schedule.startTime}-${schedule.endTime}`,
            purpose,
            teacherName: params.teacherName,
            isRecurring: false,
          };
        }
      }

      throw new Error(
        `Cannot parse day/date: "${schedule.day}" for resource ${resourceCode}`
      );
    }
  }

  /**
   * Parsear día de la semana en español a número
   */
  private parseDayOfWeek(day: string): number | null {
    const normalized = day.toLowerCase().trim();
    return DAY_MAP[normalized] ?? null;
  }

  /**
   * Intentar parsear una fecha específica
   */
  private parseSpecificDate(dateStr: string): string | null {
    // ISO format
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      return dateStr.split("T")[0];
    }

    // DD/MM/YYYY
    const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
    }

    return null;
  }

  /**
   * Construir fecha ISO a partir de una fecha base y una hora (HH:MM)
   */
  private buildDateTimeISO(baseDate: string, time: string): string {
    const datePart = baseDate.split("T")[0];
    const timePart = time.includes(":") ? time : "00:00";
    return `${datePart}T${timePart}:00Z`;
  }
}
