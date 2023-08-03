import { DossierDS } from "../../../src/modules/dossiers/objects/entities/dossier_ds.entity";
import { Demarche } from "../../../src/modules/demarches/entities/demarche.entity";
import { Dossier } from "../../../src/modules/dossiers/objects/entities/dossier.entity";
import { faker } from "@faker-js/faker/locale/fr";
import { DossierState } from "@dnum-mi/ds-api-client/dist/@types/types";

export function getFakeDossierTest(
  dossierDS: DossierDS,
  demarche?: Demarche,
): Partial<Dossier> {
  return {
    dossierDS,
    demarche,
    state: faker.datatype.string() as unknown as DossierState,
  };
}

export function getFakeDossierDs(): Partial<DossierDS> {
  return {
    id: faker.datatype.number(),
    //TODO: Ne doit-il pas être du type TDossier
    dataJson: JSON.parse(faker.datatype.json()),
    dsUpdateAt: faker.date.past(),
  };
}
