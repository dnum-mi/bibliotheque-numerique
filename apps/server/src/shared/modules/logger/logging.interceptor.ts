import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { catchError, finalize } from 'rxjs/operators'
import { LoggerService } from './logger.service'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(LoggingInterceptor.name)
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now()

    const httpContext = context.switchToHttp()
    const request = httpContext.getRequest()
    const response = httpContext.getResponse()

    const { method, url, headers, httpVersion, socket } = request

    const userAgent = headers['user-agent']
    const forwardedFor = headers['x-forwarded-for']
    const referer = headers.referer
    const origin = headers.origin

    const remoteAddress = socket?.remoteAddress
    const requestSize = headers['content-length'] || 0

    const user = request.user || null

    const ip =
      headers['x-forwarded-for'] ||
      headers['x-real-ip'] ||
      socket?.remoteAddress

    let statusCode = 200

    return next.handle().pipe(
      catchError((err) => {
        statusCode = err?.status ?? err?.statusCode ?? 500
        return throwError(() => err)
      }),

      finalize(() => {
        const delay = Date.now() - start
        const contentLength = response.getHeader('content-length') || 0

        const payload = {
          message: `Request: ${method} ${url} -> Response: ${statusCode} in ${delay}ms`,
          method,
          url,
          statusCode,
          delay,
          ip,
          remoteAddress,
          forwardedFor,
          userAgent,
          referer,
          origin,
          httpVersion,
          requestSize,
          contentLength,

          user: user
            ? {
              id: user.id,
              email: user.email,
              fullName: `${user.lastName} ${user.firstName}`,
              roleName: user.role?.label,
            }
            : 'Anonymous',
        }

        if (statusCode >= 500) {
          this.logger.error(payload)
        } else if (statusCode >= 400) {
          this.logger.warn(payload)
        } else {
          this.logger.log(payload)
        }
      }),
    )
  }
}
