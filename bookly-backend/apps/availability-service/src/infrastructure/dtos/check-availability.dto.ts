import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator";

/**
 * Check Availability DTO
 */
export class CheckAvailabilityDto {
  @ApiProperty({
    description: "ID del recurso a consultar",
    example: "507f1f77bcf86cd799439011",
  })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({
    description: "Fecha y hora de inicio",
    type: Date,
    example: "2025-01-10T08:00:00Z",
  })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: "Fecha y hora de fin",
    type: Date,
    example: "2025-01-10T10:00:00Z",
  })
  @IsDate()
  @Type(() => Date)
  endDate: Date;
}
