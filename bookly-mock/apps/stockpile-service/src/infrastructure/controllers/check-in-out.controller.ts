import { ResponseUtil } from "@libs/common";
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
  ): Promise<any> {
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
    return ResponseUtil.success(result.toObject(), 'Check-in completed successfully');
  }

  @Post("check-out")
  @ApiOperation({ summary: "Realizar check-out de una reserva" })
  @ApiResponse({ status: 200, type: CheckInOutResponseDto })
  async checkOut(
    @Body() dto: CheckOutRequestDto,
    @Request() req: any
  ): Promise<any> {
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
    return ResponseUtil.success(result.toObject(), 'Check-out completed successfully');
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener check-in/out por ID" })
  @ApiResponse({ status: 200, type: CheckInOutResponseDto })
  async getById(@Param("id") id: string): Promise<any> {
    const result = await this.checkInOutService.findById(id);
    if (!result) {
      throw new Error("Check-in/out no encontrado");
    }
    return ResponseUtil.success(result.toObject(), 'Check-in/out record retrieved successfully');
  }

  @Get("reservation/:reservationId")
  @ApiOperation({ summary: "Obtener check-in/out por ID de reserva" })
  @ApiResponse({ status: 200, type: CheckInOutResponseDto })
  async getByReservation(
    @Param("reservationId") reservationId: string
  ): Promise<any> {
    const result =
      await this.checkInOutService.findByReservationId(reservationId);
    if (!result) {
      throw new Error("Check-in/out no encontrado");
    }
    return ResponseUtil.success(result.toObject(), 'Reservation check-in/out retrieved successfully');
  }

  @Get("user/me")
  @ApiOperation({
    summary: "Obtener historial de check-ins del usuario autenticado",
  })
  @ApiResponse({ status: 200, type: [CheckInOutResponseDto] })
  async getMyHistory(@Request() req: any): Promise<any> {
    const results = await this.checkInOutService.findByUserId(req.user.sub);
    const data = results.map((r) => r.toObject());
    return ResponseUtil.success(data, 'User check-in history retrieved successfully');
  }

  @Get("active/all")
  @ApiOperation({ summary: "Obtener todos los check-ins activos" })
  @ApiResponse({ status: 200, type: [CheckInOutResponseDto] })
  async getActive(): Promise<any> {
    const results = await this.checkInOutService.findActive();
    const data = results.map((r) => r.toObject());
    return ResponseUtil.success(data, 'Active check-ins retrieved successfully');
  }

  @Get("overdue/all")
  @ApiOperation({ summary: "Obtener check-ins vencidos" })
  @ApiResponse({ status: 200, type: [CheckInOutResponseDto] })
  async getOverdue(): Promise<any> {
    const results = await this.checkInOutService.findOverdue();
    const data = results.map((r) => r.toObject());
    return ResponseUtil.success(data, 'Overdue check-ins retrieved successfully');
  }
}
