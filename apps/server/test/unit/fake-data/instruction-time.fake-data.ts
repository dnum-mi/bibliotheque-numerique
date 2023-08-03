import { Dossier } from "../../../src/modules/dossiers/objects/entities/dossier.entity";
import { faker } from "@faker-js/faker/locale/fr";
import { EInstructionTimeState } from "../../../src/plugins/instruction_time/instruction_times/types/IntructionTime.type";
import { InstructionTime } from "../../../src/plugins/instruction_time/instruction_times/instruction_time.entity";

export function getFakeInstructionTime(
  dossier: Dossier,
): Partial<InstructionTime> {
  return {
    dossier,
    startAt: faker.date.past(),
    stopAt: faker.date.past(),
    endAt: faker.date.past(),
    state: faker.helpers.arrayElement(Object.values(EInstructionTimeState)),
  };
}
