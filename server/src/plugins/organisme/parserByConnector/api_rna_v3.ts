import { IParseToOrganisme } from "./parse_to_organisme.interface";
export type TDataApiRnaV3 = {
  rna_id: string;
  titre: string;
  objet: string;
  siret: string | null;
  siret_siege_social: string | null;
  date_creation: string | null;
  date_declaration: string | null;
  date_publication: string | null;
  date_dissolution: string | null;
  adresse_siege: {
    complement: string;
    numero_voie: string;
    type_voie: string;
    libelle_voie: string;
    distribution: string;
    code_insee: string;
    code_postal: string;
    commune: string;
  };
  etat: boolean;
  groupement: string | null;
  mise_a_jour: string;
};

export type TResultApiRnaV3 = {
  data: TDataApiRnaV3;
  links: object;
  meta: object;
};

export default class ParseApiRnaV3
  implements IParseToOrganisme<Partial<TDataApiRnaV3>, TResultApiRnaV3>
{
  dataJson: Partial<TDataApiRnaV3>;
  getDataUpdateAt(): Date {
    return new Date(this.dataJson.mise_a_jour);
  }
  setDataJson(result: Partial<{ data: Partial<TResultApiRnaV3> }>) {
    if (!result?.data) {
      throw new Error("Data is empty or undefined");
    }
    this.dataJson = result?.data?.data;
  }
}
