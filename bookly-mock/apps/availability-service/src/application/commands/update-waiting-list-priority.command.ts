export class UpdateWaitingListPriorityCommand {
  constructor(
    public readonly id: string,
    public readonly priority: number,
    public readonly reason?: string,
  ) {}
}
