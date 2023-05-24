import { faker } from "@faker-js/faker/locale/fr";
import { InstructionTime } from "..";
import { Dossier } from "../../../../shared/entities";
import { EInstructionTimeState } from "../../types/IntructionTime.type";

export function instructionTime_test(
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
export const createOneInstructionTime = async (data) => {
  const instructionTime = InstructionTime.create();
  for (const entry in data) {
    instructionTime[entry] = data[entry];
  }
  return await instructionTime.save();
};
