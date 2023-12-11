import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { LoggerService } from './logger.service'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now()
    const httpContext = context.switchToHttp()
    const request = httpContext.getRequest()
    const response = httpContext.getResponse()
    const { method, url, headers, httpVersion, socket } = request
    const userAgent = headers['user-agent']
    const forwardedFor = headers['x-forwarded-for']
    const remoteAddress = socket.remoteAddress
    const contentLength = response.getHeader('content-length') || 0
    const user = request.user || null

    return next.handle().pipe(
      tap(() => {
        const { statusCode } = response
        const delay = Date.now() - now
        this.logger.log({
          message: `Request: ${method} ${url} -> Response: ${statusCode} in ${delay}ms`,
          method,
          url,
          statusCode,
          delay,
          userAgent,
          remoteAddress,
          httpVersion,
          contentLength,
          forwardedFor,
          user: user
            ? {
              id: user.id,
              email: user.email,
              fullName: user.lastName + ' ' + user.firstName,
              roleName: user.role?.label,
            }
            : 'Anonymous',
        })
      }),
    )
  }
}
