import {
  Controller,
  Get,
  Body,
  Param,
  Post,
  HttpException,
  HttpStatus,
  Logger,
  ParseIntPipe,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { LoggerService } from "../../../modules/logger/logger.service";
import { OrganismesService } from "./organismes.service";

@ApiTags("Organismes")
@Controller("organismes")
export class OrganismesController {
  private readonly logger = new Logger(
    OrganismesController.name,
  ) as unknown as LoggerService;

  constructor(private readonly organismesService: OrganismesService) {}

  @Get()
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  findOneById(@Param("id", ParseIntPipe) id: number) {
    return this.organismesService.findOneById(id);
  }

  @Get("rna/:id")
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  findOneByIdRna(@Param("id") id: string) {
    return this.organismesService.findOneByIdRef(id);
  }

  @Post("rna")
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

      return { message: `organisme RNA: ${idRNA} create success!` };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw new HttpException(
          `organisme RNA: ${idRNA} not found`,
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
