/* eslint-disable */

import { Test, TestingModule } from "@nestjs/testing";
import { InstructionTimesController } from "./instruction_times.controller";
import { InstructionTimesService } from "./instruction_times.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import configuration from "../../../config/configuration";
import instructionTimeMappingConfig from "../config/instructionTimeMapping.config";
import { typeormFactoryLoader } from "../../../shared/utils/typeorm-factory-loader";
import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { loggerServiceMock } from "../../../../test/mock/logger-service.mock";
import {
  getFakeDossierDs,
  getFakeDossierTest,
} from "../../../../test/unit/fake-data/dossier.fake-data";
import { getFakeInstructionTime } from "../../../../test/unit/fake-data/instruction-time.fake-data";
import { InstructionTime } from "./instruction_time.entity";
import { DossiersModule } from "../../../modules/dossiers/dossiers.module";
import { Dossier } from "../../../modules/dossiers/objects/entities/dossier.entity";
import dsConfig from "../../../config/ds.config";
import fileConfig from "../../../config/file.config";
import { DsApiModule } from "../../../shared/modules/ds-api/ds-api.module";

describe("InstructionTimesController", () => {
  let controller: InstructionTimesController;
  let service: InstructionTimesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // TODO: typeorm should not be imported for unit test, neither should it be imported twice for connection and injection
        TypeOrmModule.forRootAsync(typeormFactoryLoader),
        TypeOrmModule.forFeature([InstructionTime, Dossier]),
        DossiersModule,
        DsApiModule,
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          load: [configuration, dsConfig, fileConfig, instructionTimeMappingConfig],
        }),
      ],
      controllers: [InstructionTimesController],
      providers: [InstructionTimesService],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    controller = module.get<InstructionTimesController>(
      InstructionTimesController,
    );
    service = module.get<InstructionTimesService>(InstructionTimesService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  const dossierDs = getFakeDossierDs();
  const dossier = getFakeDossierTest(dossierDs as any);
  const instructionTime = getFakeInstructionTime(dossier as any);
  const dossierDs2 = getFakeDossierDs();
  const dossier2 = getFakeDossierTest(dossierDs2 as any);
  const instructionTime2 = getFakeInstructionTime(dossier2 as any);

  describe("findAll", () => {
    it("should return empty array", async () => {
      const result: Promise<InstructionTime[]> = [] as any;
      jest.spyOn(service, "findAll").mockImplementation(() => result);

      await expect(controller.findAll()).toEqual([]);
    });

    it("should return an array of InstructionTimes", async () => {
      const result: Promise<InstructionTime[]> = [
        instructionTime,
        instructionTime2,
      ] as any;
      jest.spyOn(service, "findAll").mockImplementation(() => result);

      await expect(controller.findAll()).toBe(result);
    });
  });

  describe("findOne", () => {
    it("should return error", async () => {
      jest
        .spyOn(service, "findOne")
        .mockRejectedValue(new Error("Unable to retrieve InstructionTime"));
      await expect(controller.findOne(0)).rejects.toThrow(
        "Unable to retrieve InstructionTime",
      );
    });

    it("should return a InstructionTimes", async () => {
      instructionTime.id = 1;
      jest
        .spyOn(service, "findOne")
        .mockImplementation(() => instructionTime as any);
      await expect(controller.findOne(instructionTime.id)).toBe(
        instructionTime,
      );
    });
  });

  describe("findOneByDossierId", () => {
    it("should return error", async () => {
      jest
        .spyOn(service, "findOneByDossier")
        .mockRejectedValue(new Error("Unable to retrieve InstructionTime"));
      await expect(controller.findOneByDossierId(0)).rejects.toThrow(
        "Unable to retrieve InstructionTime",
      );
    });

    it("should return a InstructionTimes", async () => {
      instructionTime.dossier.id = 100;
      jest
        .spyOn(service, "findOneByDossier")
        .mockImplementation(() => instructionTime as any);
      await expect(
        controller.findOneByDossierId(instructionTime.dossier.id),
      ).toBe(instructionTime);
    });
  });
});
