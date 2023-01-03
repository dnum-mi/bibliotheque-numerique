import { Organisme, OrganismesSource } from "./organisme/entities";

import { OrganismesModule } from "./organisme/organismes/organismes.module";
import { OrganismesSourcesModule } from "./organisme/organismes_sources/organismes_sources_module";

export const pluginsEntities = [Organisme, OrganismesSource];

export const pluginsModules = [OrganismesModule, OrganismesSourcesModule];
