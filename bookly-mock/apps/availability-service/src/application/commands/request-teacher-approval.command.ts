/**
 * Request Teacher Approval Command (RF-13)
 * Command para solicitar VoBo docente en reservas de estudiantes
 */
export class RequestTeacherApprovalCommand {
  constructor(
    public readonly reservationId: string,
    public readonly studentId: string,
    public readonly teacherId: string,
    public readonly reason: string,
    public readonly timeoutMinutes: number = 1440,
    public readonly createdBy?: string
  ) {}
}
