// TODO: fixe type
/* eslint-disable */

import { Test, TestingModule } from "@nestjs/testing";
import { DossierController } from "./dossier.controller";
import { DossierService } from "../providers/dossier.service";
import { ConfigModule } from "@nestjs/config";
import instructionTimeMappingConfig from "../../../plugins/instruction_time/config/instructionTimeMapping.config";
import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { loggerServiceMock } from "../../../../test/mock/logger-service.mock";
import { Dossier } from "../objects/entities/dossier.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeormFactoryLoader } from "../../../shared/utils/typeorm-factory-loader";
import { InstructionTime } from "../../../plugins/instruction_time/instruction_times/instruction_time.entity";
import { DemarcheModule } from "../../demarches/demarche.module";
import { Demarche } from "../../demarches/objects/entities/demarche.entity";
import dsConfig from "../../../config/ds.config";
import fileConfig from "../../../config/file.config";
import { Field } from "../objects/entities/field.entity";
import { FieldService } from "../providers/field.service";
import { DsApiModule } from "../../../shared/modules/ds-api/ds-api.module";

describe("DossierController", () => {
  let controller: DossierController;
  let service: DossierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // TODO: typeorm should not be imported for unit test, neither should it be imported twice for connection and injection
        TypeOrmModule.forRootAsync(typeormFactoryLoader),
        TypeOrmModule.forFeature([InstructionTime, Dossier, Demarche, Field]),
        DemarcheModule,
        DsApiModule,
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          load: [dsConfig, fileConfig, instructionTimeMappingConfig],
        }),
      ],
      controllers: [DossierController],
      providers: [DossierService, FieldService],
    })
      .useMocker((token) => {
        if (token === LoggerService) {
          return loggerServiceMock;
        }
        return null;
      })
      .compile();

    controller = module.get<DossierController>(DossierController);
    service = module.get<DossierService>(DossierService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it.each`
    name                   | servicefn              | fn
    ${"findAll"}           | ${"findWithFilter"}    | ${() => controller.findAll()}
    ${"findOne"}           | ${"findOne"}           | ${() => controller.findOne("TEST")}
    ${"findOneWithDetail"} | ${"findOneWithDetail"} | ${() => controller.findOneWithDetail("TEST")}
  `("$name: should get dossiers ", async ({ servicefn, fn }) => {
    const result = ["dossiers"];
    jest.spyOn(service, servicefn).mockImplementation(() => result);
    expect(await fn()).toBe(result);
  });

  it("findAllAndMap: should throw error when there are nothing", async () => {
    jest.spyOn(service, "findWithFilter").mockImplementation(async () => []);
    await expect(() => controller.findAll()).rejects.toThrow(
      "No dossier found",
    );
  });

  it.each`
    name                   | servicefn              | fn
    ${"findOne"}           | ${"findOne"}           | ${() => controller.findOne("TEST")}
    ${"findOneWithDetail"} | ${"findOneWithDetail"} | ${() => controller.findOneWithDetail("TEST")}
  `(
    "$name: should throw error when there are nothing",
    async ({ servicefn, fn }) => {
      jest.spyOn(service, servicefn).mockImplementation(() => null);
      await expect(fn).rejects.toThrow("Dossier id: TEST not found");
    },
  );

  it.each`
    name                   | servicefn              | fn
    ${"findAll"}           | ${"findWithFilter"}    | ${() => controller.findAll()}
    ${"findOne"}           | ${"findOne"}           | ${() => controller.findOne("TEST")}
    ${"findOneWithDetail"} | ${"findOneWithDetail"} | ${() => controller.findOneWithDetail("TEST")}
  `(
    "$name: should throw error with message of error when there are error",
    async ({ name, servicefn, fn }) => {
      const message = `Test Error ${name}`;
      jest.spyOn(service, servicefn).mockImplementation(() => {
        throw new Error(message);
      });
      await expect(fn).rejects.toThrow(message);
    },
  );
});
