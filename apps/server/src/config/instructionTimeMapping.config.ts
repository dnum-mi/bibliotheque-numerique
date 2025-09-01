import { registerAs } from '@nestjs/config'

export type TInstructionTimeMappingConfig = {
  NB_DAYS_AFTER_INSTRUCTION: number;
  NB_DAYS_AFTER_EXTENSION: number;
  NB_DAYS_AFTER_INTENT_OPPOSITION: number;
};

export default registerAs('instructionTime', () => ({
  // bn-code to keys
  NB_DAYS_AFTER_INSTRUCTION: 60,
  NB_DAYS_AFTER_EXTENSION: 120,
  NB_DAYS_AFTER_INTENT_OPPOSITION: 30,
}))
