import { faker } from "@faker-js/faker/locale/fr";

export const idRNAFake = () => `W${faker.random.numeric(9)}`;

export function getDatasFromRNA(idRNA?: string) {
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

export function updateOrgFromRNA(data) {
  return {
    ...data,
    objet: faker.company.catchPhrase(),
    mise_a_jour: faker.date.between(data.mise_a_jour, Date.now()).toISOString(),
  };
}
