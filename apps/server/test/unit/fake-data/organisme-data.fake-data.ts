/* eslint-disable */
import { faker } from "@faker-js/faker/locale/fr";
import { OrganismesData } from "../../../src/plugins/organisme/organismes/organisme_data.entity";

export function getFakeOrganismesData(): OrganismesData {
  const idRNA = getFakeIdRNA();
  const dataUpdateAt = faker.date.past();
  const updateAt = faker.date.past({ years: 1, refDate:  dataUpdateAt });

  return {
    organismesSource: {
      id: faker.number.int(),
      name: "API_ENTREPRISE_RNA_V3",
    },
    id: faker.number.int({max:100000}),
    idRef: idRNA,
    dataJson: JSON.parse(JSON.stringify(getFakeDatasFromRNA(idRNA))),
    dataUpdateAt,
    createAt: faker.date.past(),
    updateAt,
  } as unknown as OrganismesData;
}

export const getFakeIdRNA = () => `W${faker.string.numeric(9)}`;

export function getFakeDatasFromRNA(idRNA?: string) {
  return {
    rna_id: idRNA || `W${faker.string.numeric(9)}`,
    titre: faker.company.name(),
    objet: faker.company.catchPhrase(),
    siret: faker.string.numeric(14),
    siret_siege_social: faker.string.numeric(14),
    date_creation: faker.date.past().toISOString(),
    date_declaration: faker.date.past().toISOString(),
    date_publication: faker.date.past().toISOString(),
    date_dissolution: faker.date.past().toISOString(),
    adresse_siege: {
      complement: "",
      numero_voie: faker.location.buildingNumber(),
      type_voie: faker.location.street(),
      libelle_voie: faker.location.streetAddress(),
      distribution: faker.location.direction(),
      code_insee: faker.location.zipCode(),
      code_postal: faker.location.zipCode(),
      commune: faker.location.city(),
    },
    etat: faker.datatype.boolean(),
    groupement: faker.string.sample(),
    mise_a_jour: faker.date.past().toISOString(),
  };
}

export function getFakeUpdateOrgFromRNA(data) {
  return {
    ...data,
    objet: faker.company.catchPhrase(),
    mise_a_jour: faker.date.between({ from: data.mise_a_jour, to: Date.now() }).toISOString(),
  };
}
