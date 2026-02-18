import {
  DashboardIncludeSection,
  DashboardPeriod,
} from "@reports/application/queries/dashboard.queries";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from "class-validator";

const normalizeIncludeSections = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .flatMap((entry) =>
        typeof entry === "string" ? entry.split(",") : String(entry),
      )
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
};

export class QueryDashboardDto {
  @ApiPropertyOptional({
    description: "Periodo predefinido para el dashboard",
    enum: DashboardPeriod,
    example: DashboardPeriod.LAST_30,
  })
  @IsOptional()
  @IsEnum(DashboardPeriod)
  period?: DashboardPeriod;

  @ApiPropertyOptional({
    description: "Fecha inicial en formato ISO-8601",
    example: "2026-02-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: "Fecha final en formato ISO-8601",
    example: "2026-02-28T23:59:59.999Z",
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({
    description: "Zona horaria IANA",
    example: "America/Bogota",
  })
  @IsOptional()
  @IsString()
  tz?: string;

  @ApiPropertyOptional({
    description: "Filtrar por tipo de recurso",
    example: "ROOM",
  })
  @IsOptional()
  @IsString()
  resourceTypeId?: string;

  @ApiPropertyOptional({
    description: "Filtrar por sede o ubicación",
    example: "campus-central",
  })
  @IsOptional()
  @IsString()
  locationId?: string;

  @ApiPropertyOptional({
    description: "Filtrar por programa académico",
    example: "systems-engineering",
  })
  @IsOptional()
  @IsString()
  programId?: string;

  @ApiPropertyOptional({
    description:
      "Secciones del payload a incluir. Soporta CSV o query repetida",
    enum: DashboardIncludeSection,
    isArray: true,
    example: [
      DashboardIncludeSection.KPIS,
      DashboardIncludeSection.SUMMARY,
      DashboardIncludeSection.TREND,
    ],
  })
  @IsOptional()
  @Transform(({ value }) => normalizeIncludeSections(value))
  @IsArray()
  @IsEnum(DashboardIncludeSection, { each: true })
  include?: DashboardIncludeSection[];
}
