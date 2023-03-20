import { toDate } from "../../../utiles/utilesDate";
import { Organisme } from "../entities";
import { IParseToOrganisme } from "./parse_to_organisme.interface";
export type TDataApiRnaV1 = {
  id: number;
  is_waldec: string;
  id_association: string;
  id_ex_association: string;
  siret: string;
  numero_reconnaissance_utilite_publique: string;
  code_gestion: string;
  date_creation: string;
  date_derniere_declaration: string;
  date_publication_creation: string;
  date_declaration_dissolution: string;
  nature: string;
  groupement: string;
  titre: string;
  titre_court: string;
  objet: string;
  objet_social1: string;
  objet_social2: string;
  l1_adresse_import: string;
  l2_adresse_import: string;
  l3_adresse_import: string;
  adresse_siege: string;
  adresse_numero_voie: string;
  adresse_repetition: string;
  adresse_type_voie: string;
  adresse_libelle_voie: string;
  adresse_distribution: string;
  adresse_code_insee: string;
  adresse_code_postal: string;
  adresse_libelle_commune: string;
  adresse_gestion_nom: string;
  adresse_gestion_format_postal: string;
  adresse_gestion_geo: string;
  adresse_gestion_libelle_voie: string;
  adresse_gestion_distribution: string;
  adresse_gestion_code_postal: string;
  adresse_gestion_acheminement: string;
  adresse_gestion_pays: string;
  dirigeant_civilite: string;
  telephone: string;
  site_web: string;
  email: string;
  autorisation_publication_web: string;
  observation: string;
  position_activite: string;
  derniere_maj: Date;
  created_at: Date | number;
  updated_at: Date | number;
};

export type TResultApiRnaV1 = {
  //TODO: A reférifier avec la doc
  // total_results: number;
  // total_pages: number;
  // per_page: number;
  // page: number;
  // association: [TDataApiRnaV1];
  association: TDataApiRnaV1;
};

export default class ParseApiRnaV1
  implements IParseToOrganisme<Partial<TDataApiRnaV1>, TResultApiRnaV1>
{
  toOrganismeEntity(
    organisme: Organisme,
    orgDataDataJson: Partial<TDataApiRnaV1>,
  ): Organisme {
    const newOrganisme = organisme || new Organisme();
    newOrganisme.idRef = orgDataDataJson.id_association;
    newOrganisme.title = orgDataDataJson.titre;

    newOrganisme.address = `${orgDataDataJson?.adresse_numero_voie || ""} ${
      orgDataDataJson?.adresse_type_voie || ""
    } ${orgDataDataJson?.adresse_libelle_voie || ""} ${
      orgDataDataJson?.adresse_code_postal || ""
    } ${orgDataDataJson?.adresse_libelle_commune || ""}`;

    newOrganisme.city = orgDataDataJson?.adresse_libelle_commune;
    newOrganisme.zipCode = orgDataDataJson?.adresse_code_postal;

    newOrganisme.dateCreation = toDate(orgDataDataJson?.date_creation);
    newOrganisme.dateModification = orgDataDataJson?.derniere_maj;
    newOrganisme.dateDissolution = toDate(
      orgDataDataJson?.date_declaration_dissolution,
    );
    newOrganisme.datePublication = toDate(
      orgDataDataJson?.date_publication_creation,
    );
    newOrganisme.dateDeclaration = toDate(
      orgDataDataJson.date_derniere_declaration,
    );

    return newOrganisme;
  }

  dataJson: Partial<TDataApiRnaV1>;
  setDataJson(result: { data: Partial<TResultApiRnaV1> }): void {
    this.dataJson = result?.data?.association;
  }
  getDataUpdateAt(): Date {
    return new Date(this.dataJson?.derniere_maj);
  }
}
