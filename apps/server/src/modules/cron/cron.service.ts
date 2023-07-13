import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoggerService } from "../../shared/modules/logger/logger.service";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { DemarchesDSService } from "../demarches/providers/demarches_ds.service";
import { DossiersDSService } from "../dossiers/providers/dossiers_ds.service";
import { JobLogService } from "../job-log/providers/job-log.service";
import { JobNames } from "./job-name.enum";

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
    this.logger.setContext(this.constructor.name);
    this.logger.log("Cron fetching data is set at: ");
    this.logger.log(this.config.get("fetchDataInterval"));
  }

  private _dynamiclyBuildCronInRegistryFromConfig(): void {
    const mapperJobs = [
      {
        cron: this.config.get("fetchDataInterval"),
        fct: this._fetchData,
        description: "Fetching Data from Démarche Simplifiée",
      },
    ];

    mapperJobs.map((mapper) => {
      const job = new CronJob(mapper.cron, mapper.fct.bind(this));
      this.schedulerRegistry.addCronJob(mapper.description, job);
      job.start();
    });
  }

  private _launchCronOnStartup(): void {
    if (this.config.get("fetchDataOnStartup")) {
      this._fetchData();
    } else {
      this.logger.log(
        "fetchDataOnStartup is set to false, skipping data fetching on startup",
      );
    }
  }

  onModuleInit(): void {
    this._dynamiclyBuildCronInRegistryFromConfig();
  }

  onApplicationBootstrap(): void {
    this._launchCronOnStartup();
  }

  private async _fetchData(): Promise<void> {
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
