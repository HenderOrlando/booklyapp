import { CheckInOutType } from "@libs/common/enums";
import { DigitalSignature } from "../services/digital-signature.service";

export class CheckOutCommand {
  constructor(
    public readonly checkInId: string,
    public readonly userId: string,
    public readonly type: CheckInOutType,
    public readonly notes?: string,
    public readonly resourceCondition?: string,
    public readonly damageReported?: boolean,
    public readonly damageDescription?: string,
    public readonly digitalSignature?: string,
    public readonly signatureMetadata?: Partial<DigitalSignature["metadata"]>,
    public readonly metadata?: Record<string, any>
  ) {}
}
