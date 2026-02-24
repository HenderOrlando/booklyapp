import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class NotifyWaitingListDto {
  @ApiProperty({ description: "ID del recurso" })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({ description: "Fecha desde la que está disponible" })
  @IsDateString()
  @IsNotEmpty()
  availableFrom: string;

  @ApiProperty({ description: "Fecha hasta la que está disponible" })
  @IsDateString()
  @IsNotEmpty()
  availableUntil: string;

  @ApiPropertyOptional({ description: "Número de usuarios a notificar" })
  @IsInt()
  @IsOptional()
  notifyTop?: number;
}
