import { IParseToOrganisme } from "./parse_to_organisme.interface";
import { Organisme } from "../entities";
import { toDate } from "../../../utils/utilsDate";

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

  setDataJson(result: { data: Partial<TResultApiRnaV3> }): void {
    if (!result?.data) {
      throw new Error("Data is empty or undefined");
    }
    this.dataJson = result?.data?.data;
  }

  toOrganismeEntity(organisme: Organisme, orgDataDataJson: TDataApiRnaV3) {
    const newOrganisme = organisme || new Organisme();
    newOrganisme.idRef = orgDataDataJson.rna_id;
    newOrganisme.title = orgDataDataJson.titre;

    newOrganisme.address = `${
      orgDataDataJson?.adresse_siege?.complement || ""
    } ${orgDataDataJson?.adresse_siege?.numero_voie || ""} ${
      orgDataDataJson?.adresse_siege?.type_voie || ""
    } ${orgDataDataJson?.adresse_siege?.libelle_voie || ""} ${
      orgDataDataJson?.adresse_siege?.code_postal || ""
    } ${orgDataDataJson?.adresse_siege?.commune || ""}`;

    newOrganisme.city = orgDataDataJson?.adresse_siege?.commune;
    newOrganisme.zipCode = orgDataDataJson.adresse_siege?.code_postal;

    newOrganisme.dateCreation = toDate(orgDataDataJson.date_creation);
    newOrganisme.dateDeclaration = toDate(orgDataDataJson.date_declaration);
    newOrganisme.datePublication = toDate(orgDataDataJson.date_publication);
    newOrganisme.dateModification = toDate(orgDataDataJson.mise_a_jour);
    newOrganisme.dateDissolution = toDate(orgDataDataJson.date_dissolution);

    return newOrganisme;
  }
}
