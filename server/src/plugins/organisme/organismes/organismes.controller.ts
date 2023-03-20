import {
  Controller,
  Get,
  Body,
  Param,
  Post,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { LoggerService } from "../../../logger/logger.service";
import { OrganismesService } from "./organismes.service";

@Controller("organismes")
export class OrganismesController {
  private readonly logger = new Logger(
    OrganismesController.name,
  ) as unknown as LoggerService;

  constructor(private readonly organismesService: OrganismesService) {}

  @Get()
  async findAll() {
    try {
      return await this.organismesService.findAll();
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.organismesService.findOne(+id);
  }

  @Post("rna")
  async addOrgnaismeByIdRNA(
    @Body("idRNA") idRNA: string,
    @Body("source") source: string,
  ) {
    if (!idRNA) {
      throw new HttpException(
        `idRNA ${idRNA} is empty`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await this.organismesService.upsertOrganisme(idRNA, [source]);

      return { message: `organimse RNA: ${idRNA} create success!` };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw new HttpException(
          `organimse RNA: ${idRNA} not found`,
          error.statusCode,
        );
      }

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
}
