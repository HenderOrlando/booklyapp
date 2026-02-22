export class NotifyWaitingListCommand {
  constructor(
    public readonly resourceId: string,
    public readonly availableFrom: Date,
    public readonly availableUntil: Date,
    public readonly notifyTop?: number,
  ) {}
}
