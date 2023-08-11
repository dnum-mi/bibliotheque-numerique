import { Controller, Get, ParseArrayPipe, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { InstructionTimesService } from './instruction_times.service'

@ApiTags('Instruction-times')
@Controller('instruction-times')
export class InstructionTimesController {
  constructor (
    private readonly instructionTimesService: InstructionTimesService,
  ) {}

  @Get('/dossiers/times')
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getTimesByDossiers (
    @Query(
      'ids',
      new ParseArrayPipe({ separator: ',', optional: true, items: Number }),
    )
      idDossiers: number[],
  ) {
    return this.instructionTimesService.instructionTimeCalculation(idDossiers)
  }
}
