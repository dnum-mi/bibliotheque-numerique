import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from "@nestjs/terminus";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "@/shared/modules/prisma/providers/prisma.service";
import { HealthCheckResult } from "@nestjs/terminus/dist/health-check/health-check-result.interface";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private health: HealthCheckService, private readonly prisma: PrismaHealthIndicator, private prismaService: PrismaService) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: "Récupérer l'état du serveur d'api." })
  check(): Promise<HealthCheckResult> {
    // TODO: ask Terminus module to code with TYPE.
    return this.health.check([() => this.prisma.pingCheck("prisma", this.prismaService)]);
  }
}
