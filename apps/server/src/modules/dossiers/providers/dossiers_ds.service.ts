import { Injectable } from "@nestjs/common";
import { DsApiClient } from "@dnum-mi/ds-api-client";
import { Dossier as TDossier } from "@dnum-mi/ds-api-client/dist/@types/types";
import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { DossiersService } from "./dossiers.service";
import { DataSource } from "typeorm";
import { FilesService } from "../../files/files.service";
import { ConfigService } from "@nestjs/config";
import { Champ, File, Message } from "@dnum-mi/ds-api-client/src/@types/types";
import { InstructionTimesService } from "../../../plugins/instruction_time/instruction_times/instruction_times.service";
import { DossierDS } from "../entities/dossier_ds.entity";
import { Dossier } from "../entities/dossier.entity";
import { FileStorage } from "../../files/file_storage.entity";

@Injectable()
export class DossiersDSService {
  private dsApiClient: DsApiClient;

  constructor(
    private dossiersService: DossiersService,
    private dataSource: DataSource,
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
    private instructionTimeService: InstructionTimesService,
    private readonly logger: LoggerService,
  ) {
    this.dsApiClient = new DsApiClient(
      this.configService.get("ds").apiUrl,
      this.configService.get("ds").apiToken,
    );
    this.logger.setContext(this.constructor.name);
  }

  async upsertDossierDS(
    dossierNumber: number,
    demarcheNumber: number,
  ): Promise<void> {
    const response = await this.dsApiClient.dossier(dossierNumber);
    const dossier = response?.dossier;
    return this.upsertDossierDSAndDossier(dossier, demarcheNumber);
  }

  async upsertDemarcheDossiersDS(demarcheNumber: number): Promise<void> {
    const response = await this.dsApiClient.demarcheDossiers(demarcheNumber);
    const dossiers = response?.demarche?.dossiers?.nodes;
    this.logger.log(
      `For demarche (ID: ${demarcheNumber}), NB dossier to upsert is: ${dossiers.length}`,
    );
    if (dossiers && dossiers.length > 0) {
      for (const dossier of dossiers) {
        await this.upsertDossierDSAndDossier(dossier, demarcheNumber).catch(
          (error) => {
            this.logger.error({
              short_message: `Échec de la mise à jour du dossier de DS: ${dossier.id}`,
              full_message: error.stack,
            });
          },
        );
      }
    } else {
      this.logger.warn({
        short_message: "No dossier to upsert",
        full_message: `No dossier to upsert for demarche number: ${demarcheNumber}`,
      });
    }
  }

  async upsertDossierDSAndDossier(
    dossier: Partial<TDossier>,
    demarcheNumber: number,
  ): Promise<void> {
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

    await this.proccessInstructionTime(dossier.number);
  }

  private async proccessInstructionTime(dossierId): Promise<void> {
    const dossier = await Dossier.findOneBy({
      dossierDS: { id: dossierId },
    });
    await this.instructionTimeService.proccessByDossierId(dossier.id);
  }

  private async updateFileUrlInJson(
    dossier: Partial<TDossier>,
  ): Promise<Partial<TDossier>> {
    dossier.champs = await this.replaceFileUrlInChamps(dossier.champs);

    if (dossier.annotations) {
      dossier.annotations = await this.replaceFileUrlInChamps(
        dossier.annotations,
      );
    }
    dossier.messages = await this.replaceFileUrlInMessages(dossier.messages);
    return dossier;
  }

  private async replaceFileUrlInChamps(
    champs: Array<Champ>,
  ): Promise<Array<Champ>> {
    await Promise.all(
      champs.map(async (champ) => {
        if (this.champHasFile(champ)) {
          const champFile: File = champ["file"];
          const fileStorage = await this.copyRemoteFile(champFile);
          champFile.url = this.urlFileApi(fileStorage.id);
        } else if (this.isChampRepetition(champ)) {
          const newSubChamps = await this.replaceFileUrlInChamps(
            // TODO: fixe type
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (<any>champ).champs,
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (<any>champ).champs = newSubChamps;
        }
      }),
    );
    return champs;
  }

  private async replaceFileUrlInMessages(
    messages: Array<Message>,
  ): Promise<Array<Message>> {
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

  private urlFileApi(id): string {
    return `${this.appURL()}/files/${id}`;
  }

  private appURL(): string {
    return `${this.configService.get("protocol")}://${this.configService.get(
      "appHost",
    )}${this.configService.get("appPath")}`;
  }
}
