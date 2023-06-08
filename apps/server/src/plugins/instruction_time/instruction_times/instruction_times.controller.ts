import { Controller, Get, Param, Query, ParseArrayPipe } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { InstructionTimesService } from "./instruction_times.service";

@ApiTags("Instruction-times")
@Controller("instruction-times")
export class InstructionTimesController {
  constructor(
    private readonly instructionTimesService: InstructionTimesService,
  ) {}

  @Get()
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  findAll() {
    return this.instructionTimesService.findAll();
  }

  @Get(":id")
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  findOne(@Param("id") id: string) {
    return this.instructionTimesService.findOne(+id);
  }

  @Get("/dossier/:id")
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  findOneByDossierId(@Param("id") id: string) {
    return this.instructionTimesService.findOneByDossier(+id);
  }

  @Get("/dossiers/times")
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getTimesByDossiers(
    @Query(
      "ids",
      new ParseArrayPipe({ separator: ",", optional: true, items: Number }),
    )
    idDossiers: number[],
  ) {
    return this.instructionTimesService.instructionTimeCalculation(idDossiers);
  }
}
