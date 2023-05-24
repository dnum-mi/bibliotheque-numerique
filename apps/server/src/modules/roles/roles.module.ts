import { Module } from "@nestjs/common";
import { RolesService } from "./providers/roles.service";
import { RolesController } from "./controllers/roles.controller";

@Module({
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
