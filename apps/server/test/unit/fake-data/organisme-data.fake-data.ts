/* eslint-disable */
import { faker } from "@faker-js/faker/locale/fr";
import { OrganismesData } from "../../../src/plugins/organisme/organismes_datas/organisme_data.entity";

export function getFakeOrganismesData(): OrganismesData {
  const idRNA = getFakeIdRNA();
  const dataUpdateAt = faker.date.past();
  const updateAt = faker.date.past(1, dataUpdateAt);

  return {
    organismesSource: {
      id: faker.datatype.number(),
      name: "API_ENTREPRISE_RNA_V3",
    },
    id: faker.datatype.number(),
    idRef: idRNA,
    dataJson: JSON.parse(JSON.stringify(getFakeDatasFromRNA(idRNA))),
    dataUpdateAt,
    createAt: faker.date.past(),
    updateAt,
  } as unknown as OrganismesData;
}

export const getFakeIdRNA = () => `W${faker.random.numeric(9)}`;

export function getFakeDatasFromRNA(idRNA?: string) {
  return {
    rna_id: idRNA || `W${faker.random.numeric(9)}`,
    titre: faker.company.name(),
    objet: faker.company.catchPhrase(),
    siret: faker.random.numeric(14),
    siret_siege_social: faker.random.numeric(14),
    date_creation: faker.date.past().toISOString(),
    date_declaration: faker.date.past().toISOString(),
    date_publication: faker.date.past().toISOString(),
    date_dissolution: faker.date.past().toISOString(),
    adresse_siege: {
      complement: "",
      numero_voie: faker.address.buildingNumber(),
      type_voie: faker.address.street(),
      libelle_voie: faker.address.streetAddress(),
      distribution: faker.address.direction(),
      code_insee: faker.address.zipCode(),
      code_postal: faker.address.zipCode(),
      commune: faker.address.cityName(),
    },
    etat: faker.datatype.boolean(),
    groupement: faker.datatype.string(),
    mise_a_jour: faker.date.past().toISOString(),
  };
}

export function getFakeUpdateOrgFromRNA(data) {
  return {
    ...data,
    objet: faker.company.catchPhrase(),
    mise_a_jour: faker.date.between(data.mise_a_jour, Date.now()).toISOString(),
  };
}
