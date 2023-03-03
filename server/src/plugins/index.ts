// Plugin: organisme
import { Organisme, OrganismesData } from "./organisme/entities";
import { OrganismesModule } from "./organisme/organismes/organismes.module";
import { OrganismesDatasModule } from "./organisme/organismes_datas/organismes_datas.module";

// Plugin: instruction_time
import { InstructionTime } from "./instruction_time/entities";
import { InstructionTimesModule } from "./instruction_time/instruction_times/instruction_times.module";
import { Parse2OrganismesModule } from "./organisme/parserByConnector/parse2organismes.module";

// Export Plugins
export const pluginsEntities = [Organisme, OrganismesData, InstructionTime];
export const pluginsModules = [
  OrganismesModule,
  OrganismesDatasModule,
  InstructionTimesModule,
  Parse2OrganismesModule,
];
