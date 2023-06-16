import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from "@nestjs/terminus";
import { ApiTags } from "@nestjs/swagger";
import { PrismaService } from "@/shared/modules/prisma/providers/prisma.service";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private health: HealthCheckService, private readonly prisma: PrismaHealthIndicator, private prismaService: PrismaService) {}

  @Get()
  @HealthCheck()
  check() {
    // TODO: ask Terminus module to code with TYPE.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
    return this.health.check([() => this.prisma.pingCheck("prisma", this.prismaService)]);
  }
}
