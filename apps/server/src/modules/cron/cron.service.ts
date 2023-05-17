import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoggerService } from "../../logger/logger.service";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { DemarchesDSService } from "../../demarches_ds/demarches_ds.service";
import { DossiersDSService } from "../../dossiers_ds/dossiers_ds.service";

@Injectable()
export class CronService implements OnApplicationBootstrap, OnModuleInit {
  constructor(
    private config: ConfigService,
    private logger: LoggerService,
    private schedulerRegistry: SchedulerRegistry,
    private demarcheDsService: DemarchesDSService,
    private dossierDsService: DossiersDSService,
  ) {
    this.logger.log("Cron fetching data is set at: ");
    this.logger.log(this.config.get("fetchDataInterval"));
  }

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

  private _launchCronOnStartup() {
    if (this.config.get("fetchDataOnStartup")) {
      this._fetchData();
    } else {
      this.logger.log(
        "fetchDataOnStartup is set to false, skipping data fetching on startup",
      );
    }
  }

  onModuleInit(): any {
    this._dynamiclyBuildCronInRegistryFromConfig();
  }

  onApplicationBootstrap() {
    this._launchCronOnStartup();
  }

  private async _fetchData() {
    this.logger.log(`Upserting data from DS. (demarche and dossier)`);
    const demarcheIds = await this.demarcheDsService.upsertAllDemarche();
    await Promise.all(
      demarcheIds.map(async (demarcheId) => {
        this.logger.log(`Upserting Dossier for demarche number: ${demarcheId}`);
        await this.dossierDsService.upsertDemarcheDossiersDS(demarcheId);
      }),
    );
    this.logger.log("End of DS-data upserting.");
  }
}
