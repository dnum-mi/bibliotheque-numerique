import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { LoggerService } from "@/modules/logger/logger.service";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: LoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus: HttpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
    };

    switch (true) {
      case !exception:
        this.logger.error(
          new Error("AllException filter caught something that is not defined"),
        );
        break;
      case exception instanceof Error:
        this.logger.error(exception as Error);
        break;
      case exception instanceof HttpException &&
        httpStatus === HttpStatus.INTERNAL_SERVER_ERROR:
        this.logger.error(exception as HttpException);
        break;
      default:
        this.logger.warn(exception as HttpException);
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
