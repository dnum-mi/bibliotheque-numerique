import { IParseToOrganisme } from "./parse_to_organisme.interface";
import { Organisme } from "../entities";
import { Logger } from "@nestjs/common";
import { LoggerService } from "../../../modules/logger/logger.service";
import { toDate } from "@biblio-num/utils";

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
  private readonly logger = new Logger(
    ParseApiRnaV3.name,
  ) as unknown as LoggerService;

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

  // TODO: type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

    try {
      newOrganisme.dateCreation = toDate(orgDataDataJson.date_creation);
    } catch (error) {
      this.logger.warn({
        short_message: `Error for date_creation of ${newOrganisme.idRef}: ${error.message}`,
        full_message: `Error for date_creation of ${newOrganisme.idRef}: ${error.stack}`,
      });
    }
    try {
      newOrganisme.dateDeclaration = toDate(orgDataDataJson.date_declaration);
    } catch (error) {
      this.logger.warn({
        short_message: `Error for date_declaration of ${newOrganisme.idRef}: ${error.message}`,
        full_message: `Error for date_declaration of ${newOrganisme.idRef}: ${error.stack}`,
      });
    }
    try {
      newOrganisme.datePublication = toDate(orgDataDataJson.date_publication);
    } catch (error) {
      this.logger.warn({
        short_message: `Error for date_publication of ${newOrganisme.idRef}: ${error.message}`,
        full_message: `Error for date_publication of ${newOrganisme.idRef}: ${error.stack}`,
      });
    }
    try {
      newOrganisme.dateModification = toDate(orgDataDataJson.mise_a_jour);
    } catch (error) {
      this.logger.warn({
        short_message: `Error for mise_a_jour of ${newOrganisme.idRef}: ${error.message}`,
        full_message: `Error for mise_a_jour of ${newOrganisme.idRef}: ${error.stack}`,
      });
    }
    try {
      newOrganisme.dateDissolution = toDate(orgDataDataJson.date_dissolution);
    } catch (error) {
      this.logger.warn({
        short_message: `Error for date_dissolution of ${newOrganisme.idRef}: ${error.message}`,
        full_message: `Error for date_dissolution of ${newOrganisme.idRef}: ${error.stack}`,
      });
    }

    return newOrganisme;
  }
}
