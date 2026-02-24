import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateWaitingListPriorityDto {
  @ApiProperty({ description: "Nueva prioridad" })
  @IsInt()
  @IsNotEmpty()
  newPriority: number;

  @ApiPropertyOptional({ description: "Razón del cambio" })
  @IsString()
  @IsOptional()
  reason?: string;
}
