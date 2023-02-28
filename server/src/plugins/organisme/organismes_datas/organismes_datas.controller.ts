import {
  Controller,
  Get,
  Param,
  Delete,
  Logger,
  Post,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
import { LoggerService } from "logger/logger.service";
import { OrganismesDatasService } from "./organismes_datas.service";

@Controller("organismes-datas")
export class OrganismesDatasController {
  private readonly logger = new Logger(
    OrganismesDatasController.name,
  ) as unknown as LoggerService;

  constructor(
    private readonly organismesDatasService: OrganismesDatasService,
  ) {}

  @Get()
  findAll() {
    try {
      return this.organismesDatasService.findAll();
    } catch (error) {
      this.logger.error({
        short_message: error.message,
        full_message: error.stack,
      });
    }
  }

  @Get("rna/:id")
  async getOrgnaismeDataByIdRNA(@Param("id") id: string) {
    try {
      return await this.organismesDatasService.findOneByIdRNA(id);
    } catch (error) {
      this.logger.error({
        short_message: error.message,
        full_message: error.stack,
      });

      throw new HttpException(
        error instanceof Error ? error.message : "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.organismesDatasService.findOne(+id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.organismesDatasService.remove(+id);
  }
}
