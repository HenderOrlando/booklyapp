import { CheckInOutType } from "@libs/common/enums";
import { Coordinates } from "../services/geolocation.service";

export class CheckInCommand {
  constructor(
    public readonly reservationId: string,
    public readonly userId: string,
    public readonly type: CheckInOutType,
    public readonly notes?: string,
    public readonly qrToken?: string,
    public readonly coordinates?: Coordinates,
    public readonly metadata?: Record<string, any>
  ) {}
}
