import { Dossier } from '../../../src/modules/dossiers/objects/entities/dossier.entity'
import { faker } from '@faker-js/faker/locale/fr'
import {
  EInstructionTimeState,
} from '@/modules/instruction_time/types/IntructionTime.type'
import { InstructionTime } from '@/modules/instruction_time/instruction_time.entity'

export function getFakeInstructionTime (dossier: Dossier): Partial<InstructionTime> {
  return {
    dossier,
    startAt: faker.date.past(),
    stopAt: faker.date.past(),
    endAt: faker.date.past(),
    state: faker.helpers.arrayElement(Object.values(EInstructionTimeState)),
  }
}
