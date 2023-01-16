// Plugin: organisme
import {
  Organisme,
  OrganismesSource,
  OrganismesData,
} from "./organisme/entities";
import { OrganismesModule } from "./organisme/organismes/organismes.module";
import { OrganismesSourcesModule } from "./organisme/organismes_sources/organismes_sources.module";
import { OrganismesDatasModule } from "./organisme/organismes_datas/organismes_datas.module";

// Plugin: instruction_time
import { InstructionTime } from "./instruction_time/entities";
import { InstructionTimesModule } from "./instruction_time/instruction_times/instruction_times.module";

// Export Plugins
export const pluginsEntities = [
  Organisme,
  OrganismesSource,
  OrganismesData,
  InstructionTime,
];
export const pluginsModules = [
  OrganismesModule,
  OrganismesSourcesModule,
  OrganismesDatasModule,
  InstructionTimesModule,
];
