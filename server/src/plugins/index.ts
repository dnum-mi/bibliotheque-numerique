import {
  Organisme,
  OrganismesSource,
  OrganismesData,
} from "./organisme/entities";

import { OrganismesModule } from "./organisme/organismes/organismes.module";
import { OrganismesSourcesModule } from "./organisme/organismes_sources/organismes_sources.module";
import { OrganismesDatasModule } from "./organisme/organismes_datas/organismes_datas.module";

export const pluginsEntities = [Organisme, OrganismesSource, OrganismesData];

export const pluginsModules = [
  OrganismesModule,
  OrganismesSourcesModule,
  OrganismesDatasModule,
];
