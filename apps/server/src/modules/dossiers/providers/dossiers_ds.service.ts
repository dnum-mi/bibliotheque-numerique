import { Injectable } from "@nestjs/common";
import { DsApiClient } from "@dnum-mi/ds-api-client";
import { Dossier as TDossier } from "@dnum-mi/ds-api-client/dist/@types/types";
import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { DossiersService } from "./dossiers.service";
import { DataSource, EntityManager, Repository } from "typeorm";
import { FilesService } from "../../files/files.service";
import { ConfigService } from "@nestjs/config";
import { Champ, File, Message } from "@dnum-mi/ds-api-client/src/@types/types";
import { InstructionTimesService } from "../../../plugins/instruction_time/instruction_times/instruction_times.service";
import { DossierDS } from "../entities/dossier_ds.entity";
import { FileStorage } from "../../files/file_storage.entity";
import { BaseEntityService } from "../../../shared/base-entity/base-entity.service";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class DossiersDSService extends BaseEntityService {
  private dsApiClient: DsApiClient;

  constructor(
    private dossiersService: DossiersService,
    private dataSource: DataSource,
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
    private instructionTimeService: InstructionTimesService,
    protected readonly logger: LoggerService,
    @InjectRepository(DossierDS) protected readonly repo: Repository<DossierDS>,
  ) {
    super(repo, logger);
    this.logger.setContext(this.constructor.name);
    this.dsApiClient = new DsApiClient(
      this.configService.get("ds").apiUrl,
      this.configService.get("ds").apiToken,
    );
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private async _upsertDossierDS(
    toUpsert: Partial<DossierDS> | Partial<DossierDS>[],
    transactionalEntityManager: EntityManager,
  ) {
    return transactionalEntityManager
      .createQueryBuilder()
      .insert()
      .into(DossierDS)
      .values(toUpsert)
      .orUpdate(["dataJson", "updateAt", "dsUpdateAt"], "PK_DOSSIER_DS_ID", {
        skipUpdateIfNoValuesChanged: true,
      })
      .returning(["id", "dataJson"])
      .execute();
  }

  async upsertDossierDS(
    dossierNumber: number,
    demarcheNumber: number,
  ): Promise<void> {
    this.logger.verbose("upsertDossierDS");
    const response = await this.dsApiClient.dossier(dossierNumber);
    const dossier = response?.dossier;
    return this.upsertDossierDSAndDossier(dossier, demarcheNumber);
  }

  async upsertDemarcheDossiersDS(demarcheNumber: number): Promise<void> {
    this.logger.verbose("upsertDemarcheDossiersDS");
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
    this.logger.verbose("upsertDossierDSAndDossier");
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      const toUpsert = {
        id: dossier.number,
        dataJson: dossier,
        dsUpdateAt: dossier.dateDerniereModification,
      } as Partial<DossierDS>;

      const dossierFound = await this.findOneById(dossier.number);

      if (dossierFound) {
        // TODO: update Dossier
      } else {
        dossier = await this.updateFileUrlInJson(dossier);
      }

      const upsertResultDossiersDS = await this._upsertDossierDS(
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
    this.logger.verbose("proccessInstructionTime");
    const dossier = await this.dossiersService.repository.findOneBy({
      dossierDS: { id: dossierId },
    });
    await this.instructionTimeService.proccessByDossierId(dossier.id);
  }

  private async updateFileUrlInJson(
    dossier: Partial<TDossier>,
  ): Promise<Partial<TDossier>> {
    this.logger.verbose("updateFileUrlInJson");
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
    this.logger.verbose("replaceFileUrlInChamps");
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
    this.logger.verbose("replaceFileUrlInMessages");
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
    this.logger.verbose("copyRemoteFile");
    return await this.filesService.copyRemoteFile(
      dsFile.url,
      dsFile.checksum,
      dsFile.byteSizeBigInt,
      dsFile.contentType,
      dsFile.filename,
    );
  }

  private champHasFile(champ): boolean {
    this.logger.verbose("champHasFile");
    return (
      this.configService
        .get("ds.dossier.champs.pjTypeName")
        .includes(champ["__typename"]) && champ["file"]
    );
  }

  private messageHasFile(message): boolean {
    this.logger.verbose("messageHasFile");
    return message.attachment !== null;
  }

  private isChampRepetition(champ): boolean {
    this.logger.verbose("isChampRepetition");
    return this.configService
      .get("ds.dossier.champs.repetitionTypeName")
      .includes(champ["__typename"]);
  }

  private urlFileApi(id): string {
    this.logger.verbose("urlFileApi");
    return `${this.appURL()}/files/${id}`;
  }

  private appURL(): string {
    this.logger.verbose("appURL");
    return `${this.configService.get("protocol")}://${this.configService.get(
      "appHost",
    )}${this.configService.get("appPath")}`;
  }
}
