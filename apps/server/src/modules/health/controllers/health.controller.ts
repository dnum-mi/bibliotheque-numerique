import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from "@nestjs/terminus";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  check() {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    return this.health.check([() => this.db.pingCheck("database")]);
  }
}
