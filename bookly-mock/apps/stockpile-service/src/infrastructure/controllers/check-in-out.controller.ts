import { JwtAuthGuard } from "@libs/guards";
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CheckInCommand } from "../../application/commands/check-in.command";
import { CheckOutCommand } from "../../application/commands/check-out.command";
import { CheckInOutService } from "../../application/services/check-in-out.service";
import {
  CheckInOutResponseDto,
  CheckInRequestDto,
  CheckOutRequestDto,
} from "../dtos/check-in-out.dto";

@ApiTags("Check-in/Check-out")
@Controller("check-in-out")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CheckInOutController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly checkInOutService: CheckInOutService
  ) {}

  @Post("check-in")
  @ApiOperation({ summary: "Realizar check-in de una reserva" })
  @ApiResponse({ status: 201, type: CheckInOutResponseDto })
  async checkIn(
    @Body() dto: CheckInRequestDto,
    @Request() req: any
  ): Promise<CheckInOutResponseDto> {
    const command = new CheckInCommand(
      dto.reservationId,
      req.user.sub,
      dto.type,
      dto.notes,
      undefined, // qrToken
      undefined, // coordinates
      dto.metadata
    );

    const result = await this.commandBus.execute(command);
    return result.toObject();
  }

  @Post("check-out")
  @ApiOperation({ summary: "Realizar check-out de una reserva" })
  @ApiResponse({ status: 200, type: CheckInOutResponseDto })
  async checkOut(
    @Body() dto: CheckOutRequestDto,
    @Request() req: any
  ): Promise<CheckInOutResponseDto> {
    const command = new CheckOutCommand(
      dto.checkInId,
      req.user.sub,
      dto.type,
      dto.notes,
      dto.resourceCondition,
      dto.damageReported,
      dto.damageDescription,
      undefined, // digitalSignature
      undefined, // signatureMetadata
      dto.metadata
    );

    const result = await this.commandBus.execute(command);
    return result.toObject();
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener check-in/out por ID" })
  @ApiResponse({ status: 200, type: CheckInOutResponseDto })
  async getById(@Param("id") id: string): Promise<CheckInOutResponseDto> {
    const result = await this.checkInOutService.findById(id);
    if (!result) {
      throw new Error("Check-in/out no encontrado");
    }
    return result.toObject();
  }

  @Get("reservation/:reservationId")
  @ApiOperation({ summary: "Obtener check-in/out por ID de reserva" })
  @ApiResponse({ status: 200, type: CheckInOutResponseDto })
  async getByReservation(
    @Param("reservationId") reservationId: string
  ): Promise<CheckInOutResponseDto> {
    const result =
      await this.checkInOutService.findByReservationId(reservationId);
    if (!result) {
      throw new Error("Check-in/out no encontrado");
    }
    return result.toObject();
  }

  @Get("user/me")
  @ApiOperation({
    summary: "Obtener historial de check-ins del usuario autenticado",
  })
  @ApiResponse({ status: 200, type: [CheckInOutResponseDto] })
  async getMyHistory(@Request() req: any): Promise<CheckInOutResponseDto[]> {
    const results = await this.checkInOutService.findByUserId(req.user.sub);
    return results.map((r) => r.toObject());
  }

  @Get("active/all")
  @ApiOperation({ summary: "Obtener todos los check-ins activos" })
  @ApiResponse({ status: 200, type: [CheckInOutResponseDto] })
  async getActive(): Promise<CheckInOutResponseDto[]> {
    const results = await this.checkInOutService.findActive();
    return results.map((r) => r.toObject());
  }

  @Get("overdue/all")
  @ApiOperation({ summary: "Obtener check-ins vencidos" })
  @ApiResponse({ status: 200, type: [CheckInOutResponseDto] })
  async getOverdue(): Promise<CheckInOutResponseDto[]> {
    const results = await this.checkInOutService.findOverdue();
    return results.map((r) => r.toObject());
  }
}
