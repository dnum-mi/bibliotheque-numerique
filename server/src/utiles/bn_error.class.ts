export class BNError extends Error {
  status: number;
  error: Error;
  constructor(message: string, status: number, error?: Error) {
    super(message);
    this.status = status;
    this.error = error;
  }
}
