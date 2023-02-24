import { Injectable, Logger } from "@nestjs/common";
import { DsApiClient } from "@lab-mi/ds-api-client";
import { Dossier as TDossier } from "@lab-mi/ds-api-client/dist/@types/types";
import { DossierDS, FileStorage } from "../entities";
import { LoggerService } from "../logger/logger.service";
import { DossiersService } from "../dossiers/dossiers.service";
import { DataSource } from "typeorm";
import { FilesService } from "../files/files.service";
import { ConfigService } from "@nestjs/config";
import { Champ, File, Message } from "@lab-mi/ds-api-client/src/@types/types";
import { exceptions } from "winston";

@Injectable()
export class DossiersDSService {
  private readonly logger = new Logger(
    DossiersDSService.name,
  ) as unknown as LoggerService;

  private dsApiClient = new DsApiClient(
    process.env.DS_API_URL,
    process.env.DS_API_TOKEN,
  );

  constructor(
    private dossiersService: DossiersService,
    private dataSource: DataSource,
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  async upsertDossierDS(dossierNumber: number, demarcheNumber: number) {
    try {
      const response = await this.dsApiClient.dossier(dossierNumber);
      const dossier = response?.dossier;

      return this.upsertDossierDSAndDossier(dossier, demarcheNumber);
    } catch (error) {
      this.logger.error({
        short_message: "No dossier to upsert",
        full_message: error.toString(),
      });
      throw new Error("Unable to update dossiers_ds");
    }
  }

  async upsertDemarcheDossiersDS(demarcheNumber: number) {
    try {
      const response = await this.dsApiClient.demarcheDossiers(demarcheNumber);
      const dossiers = response?.demarche?.dossiers?.nodes;
      this.logger.log(
        `For demarche (ID: ${demarcheNumber}), NB dossier to upsert is: ${dossiers.length}`,
      );
      if (dossiers && dossiers.length > 0) {
        return await Promise.all(
          dossiers.map(async (dossier) => {
            await this.upsertDossierDSAndDossier(dossier, demarcheNumber);
          }),
        );
      } else {
        this.logger.warn({
          short_message: "No dossier to upsert",
          full_message: `No dossier to upsert for demarche number: ${demarcheNumber}`,
        });
      }
    } catch (error) {
      this.logger.error({
        short_message: "Échec de la mise à jour des dossiers_ds",
        full_message: error.toString(),
      });
      throw new Error("Unable to update dossiers_ds");
    }
  }

  async upsertDossierDSAndDossier(
    dossier: Partial<TDossier>,
    demarcheNumber: number,
  ) {
    try {
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        const toUpsert = {
          id: dossier.number,
          dataJson: dossier,
          dsUpdateAt: dossier.dateDerniereModification,
        } as Partial<DossierDS>;

        const dossierFound = await DossierDS.findOneBy({ id: dossier.number });

        if (dossierFound) {
          // TODO: update Dossier
        } else {
          dossier = await this.updateFileUrlInJson(dossier);
        }

        const upsertResultDossiersDS = await DossierDS.upsertDossierDS(
          toUpsert,
          transactionalEntityManager,
        );

        const upsertResultDossiers = await this.dossiersService.upsertDossier(
          upsertResultDossiersDS.raw[0],
          demarcheNumber,
          transactionalEntityManager,
        );

        return {
          dossiersDS: upsertResultDossiersDS,
          dossiers: upsertResultDossiers,
        };
      });
    } catch (error) {
      this.logger.error({
        short_message: "Échec de la mise à jour des dossiers_ds",
        full_message: error.toString(),
      });
      throw new Error("Unable to update dossiers_ds");
    }
  }

  private async updateFileUrlInJson(dossier: Partial<TDossier>) {
    try {
      dossier.champs = await this.replaceFileUrlInChamps(dossier.champs);

      if (dossier.annotations) {
        dossier.annotations = await this.replaceFileUrlInChamps(
          dossier.annotations,
        );
      }

      dossier.messages = await this.replaceFileUrlInMessages(dossier.messages);
    } catch (error) {
      this.logger.error({
        short_message: "Échec de la mise à jour des PJs de dossiers_ds",
        full_message: error.toString(),
      });
      throw new Error("Unable to update PJ of dossiers_ds");
    }

    return dossier;
  }

  private async replaceFileUrlInChamps(champs: Array<Champ>) {
    await Promise.all(
      champs.map(async (champ) => {
        if (this.champHasFile(champ)) {
          const champFile: File = champ["file"];
          const fileStorage = await this.copyRemoteFile(champFile);
          champFile.url = this.urlFileApi(fileStorage.id);
        } else if (this.isChampRepetition(champ)) {
          const newSubChamps = await this.replaceFileUrlInChamps(
            (<any>champ).champs,
          );
          (<any>champ).champs = newSubChamps;
        }
      }),
    );
    return champs;
  }

  private async replaceFileUrlInMessages(messages: Array<Message>) {
    await Promise.all(
      messages.map(async (message) => {
        if (this.messageHasFile(message)) {
          const attachment: File = message.attachment;
          const fileStorage = await this.copyRemoteFile(attachment);
          attachment.url = this.urlFileApi(fileStorage.id);
        }
      }),
    );
    return messages;
  }

  private async copyRemoteFile(dsFile): Promise<FileStorage> {
    return await this.filesService.copyRemoteFile(
      dsFile.url,
      dsFile.checksum,
      dsFile.byteSizeBigInt,
      dsFile.contentType,
      dsFile.filename,
    );
  }

  private champHasFile(champ): boolean {
    return (
      this.configService
        .get("ds.dossier.champs.pjTypeName")
        .includes(champ["__typename"]) && champ["file"]
    );
  }

  private messageHasFile(message): boolean {
    return message.attachment !== null;
  }

  private isChampRepetition(champ): boolean {
    return this.configService
      .get("ds.dossier.champs.repetitionTypeName")
      .includes(champ["__typename"]);
  }

  private urlFileApi(id) {
    return `${this.configService.get("protocol")}://${this.configService.get(
      "appHost",
    )}/files/${id}`;
  }
}
