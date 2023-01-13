import { Controller, Get, Param, Delete } from "@nestjs/common";
import { InstructionTimesService } from "./instruction_times.service";

@Controller("instruction-times")
export class InstructionTimesController {
  constructor(
    private readonly instructionTimesService: InstructionTimesService,
  ) {}

  @Get()
  findAll() {
    return this.instructionTimesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.instructionTimesService.findOne(+id);
  }

  @Get("/dossier/:id")
  findOneByDossierId(@Param("id") id: string) {
    return this.instructionTimesService.findOneByDossier(+id);
  }
}
