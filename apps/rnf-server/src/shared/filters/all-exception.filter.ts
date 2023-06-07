import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { LoggerService } from "@/shared/modules/logger/providers/logger.service";
import { DsApiError } from "@dnum-mi/ds-api-client";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost, private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    let httpStatus: HttpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "no message.";

    switch (true) {
      case !exception:
        this.logger.error(new Error("AllException filter caught something that is not defined"));
        break;
      case exception instanceof DsApiError:
        this.logger.warn((exception as DsApiError).message);
        httpStatus = 424;
        message = (exception as DsApiError).message;
        this.logger.debug((exception as DsApiError).graphQlResponse as string);
        break;
      case exception instanceof HttpException && httpStatus !== HttpStatus.INTERNAL_SERVER_ERROR:
        message = (exception as HttpException).message;
        this.logger.warn(exception as HttpException);
        break;
      default:
        message = "Internal server error";
        this.logger.error(exception as Error);
    }

    const responseBody = {
      statusCode: httpStatus,
      message,
      path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
