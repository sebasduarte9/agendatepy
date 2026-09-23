export type SchedulingErrorCode =
  | "INVALID_INPUT"
  | "TENANT_NOT_FOUND"
  | "SERVICE_NOT_FOUND"
  | "TENANT_CONTEXT_MISSING";

export class SchedulingError extends Error {
  readonly code: SchedulingErrorCode;
  readonly status: number;

  constructor(code: SchedulingErrorCode, message: string, status: number) {
    super(message);
    this.name = "SchedulingError";
    this.code = code;
    this.status = status;
  }
}
