import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService, HttpHealthIndicator, TypeOrmHealthIndicator } from "@nestjs/terminus";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private health: HealthCheckService, private http: HttpHealthIndicator, private db: TypeOrmHealthIndicator) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.db.pingCheck("database")]);
  }
}
