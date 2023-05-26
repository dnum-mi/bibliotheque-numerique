import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoggerService } from "../logger/logger.service";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { DemarchesDSService } from "../demarches/providers/demarches_ds.service";
import { DossiersDSService } from "../dossiers/providers/dossiers_ds.service";

@Injectable()
export class CronService implements OnApplicationBootstrap, OnModuleInit {
  constructor(
    private config: ConfigService,
    private logger: LoggerService,
    private schedulerRegistry: SchedulerRegistry,
    private demarcheDsService: DemarchesDSService,
    private dossierDsService: DossiersDSService,
    private jobLogService: JobLogService,
  ) {
    this.logger.log("Cron fetching data is set at: ");
    this.logger.log(this.config.get("fetchDataInterval"));
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private _dynamiclyBuildCronInRegistryFromConfig() {
    const job = new CronJob(
      this.config.get("fetchDataInterval"),
      this._fetchData.bind(this),
    );

    this.schedulerRegistry.addCronJob(
      "Fetching Data from Démarche Simplifiée",
      job,
    );

    job.start();
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private _launchCronOnStartup() {
    if (this.config.get("fetchDataOnStartup")) {
      this._fetchData();
    } else {
      this.logger.log(
        "fetchDataOnStartup is set to false, skipping data fetching on startup",
      );
    }
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  onModuleInit() {
    this._dynamiclyBuildCronInRegistryFromConfig();
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  onApplicationBootstrap() {
    this._launchCronOnStartup();
  }

  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private async _fetchData() {
    const jobLog = await this.jobLogService.createJobLog(
      JobNames.FETCH_DATA_FROM_DS,
    );
    let thereWasAnError = false;
    // TODO: replace the behavior here when we have true logs.
    this.logger.startRegisteringLogs();
    this.logger.log(`Upserting demarche from DS.`);
    let demarcheIds: number[] = [];
    try {
      demarcheIds = await this.demarcheDsService.upsertAllDemarche();
    } catch (e) {
      thereWasAnError = true;
    }
    this.logger.log(`Upserting dossier forEach demarche.`);
    for (const demarcheId of demarcheIds) {
      this.logger.log(`Upserting Dossier for demarche number: ${demarcheId}`);
      try {
        await this.dossierDsService.upsertDemarcheDossiersDS(demarcheId);
      } catch (e) {
        thereWasAnError = true;
      }
    }
    this.logger.log("End of DS-data upserting.");
    const logs = this.logger.stopRegisteringLog();
    if (thereWasAnError) {
      this.jobLogService.setJobLogFailure(jobLog.id, logs.join("\n"));
    } else {
      this.jobLogService.setJobLogSuccess(jobLog.id, logs.join("\n"));
    }
  }
}
