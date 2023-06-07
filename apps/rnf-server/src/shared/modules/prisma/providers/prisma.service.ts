import { INestApplication, Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { LoggerService } from "@/shared/modules/logger/providers/logger.service";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly logger: LoggerService) {
    super();
    this.logger.setContext(this.constructor.name);
  }

  async onModuleInit() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await this.$connect();
    this.logger.verbose("Prisma connected");
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async enableShutdownHooks(app: INestApplication) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-misused-promises
    this.$on("beforeExit", async () => {
      await app.close();
    });
  }
}
