// Plugin: organisme
import { OrganismesModule } from "./organisme/organismes/organismes.module";

// Plugin: instruction_time
import { InstructionTimesModule } from "./instruction_time/instruction_times/instruction_times.module";
import { ParseToOrganismesModule } from "./organisme/parserByConnector/parse_to_organismes.module";

// Export Plugins
export const pluginsModules = [
  OrganismesModule,
  InstructionTimesModule,
  ParseToOrganismesModule,
];
