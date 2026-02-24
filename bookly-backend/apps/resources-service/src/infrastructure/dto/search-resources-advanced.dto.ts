import { ApiProperty } from "@nestjs/swagger";
import { ResourceStatus, ResourceType } from "@libs/common/enums";
import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

/**
 * Advanced Search Resources DTO
 * DTO para búsqueda avanzada de recursos con filtros complejos
 */
export class SearchResourcesAdvancedDto {
  @ApiProperty({
    description: "Tipos de recursos a buscar",
    enum: ResourceType,
    isArray: true,
    required: false,
    example: [ResourceType.CLASSROOM, ResourceType.AUDITORIUM],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ResourceType, { each: true })
  types?: ResourceType[];

  @ApiProperty({
    description: "Capacidad mínima requerida",
    type: Number,
    required: false,
    example: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  minCapacity?: number;

  @ApiProperty({
    description: "Capacidad máxima requerida",
    type: Number,
    required: false,
    example: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxCapacity?: number;

  @ApiProperty({
    description: "IDs de categorías de recursos",
    type: [String],
    required: false,
    example: ["category_123", "category_456"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiProperty({
    description: "IDs de programas académicos",
    type: [String],
    required: false,
    example: ["program_123", "program_456"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  programIds?: string[];

  @ApiProperty({
    description: "Equipamiento requerido (búsqueda en atributos JSON)",
    type: [String],
    required: false,
    example: ["projector", "whiteboard", "air_conditioning"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hasEquipment?: string[];

  @ApiProperty({
    description: "Ubicación del recurso (búsqueda parcial)",
    type: String,
    required: false,
    example: "Edificio A",
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: "Edificio del recurso",
    type: String,
    required: false,
    example: "Edificio A",
  })
  @IsOptional()
  @IsString()
  building?: string;

  @ApiProperty({
    description: "Estado del recurso",
    enum: ResourceStatus,
    required: false,
    example: ResourceStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(ResourceStatus)
  status?: ResourceStatus;

  @ApiProperty({
    description: "Fecha y hora de disponibilidad requerida (ISO 8601)",
    type: String,
    required: false,
    example: "2025-11-10T14:00:00Z",
  })
  @IsOptional()
  @IsDateString()
  availableOn?: string;

  @ApiProperty({
    description: "Página de resultados",
    type: Number,
    required: false,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiProperty({
    description: "Resultados por página",
    type: Number,
    required: false,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    description: "Campo de ordenamiento",
    type: String,
    required: false,
    default: "createdAt",
    example: "capacity",
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: "Orden de clasificación",
    enum: ["asc", "desc"],
    required: false,
    default: "desc",
    example: "asc",
  })
  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc";
}
