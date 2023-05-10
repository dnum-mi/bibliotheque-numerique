import { Test, TestingModule } from "@nestjs/testing";
import { DossiersController } from "./dossiers.controller";
import { DossiersService } from "./dossiers.service";
import { ConfigModule } from "@nestjs/config";
import instructionTimeMappingConfig from "../plugins/instruction_time/config/instructionTimeMapping.config";
import { InstructionTimesModule } from "../plugins/instruction_time/instruction_times/instruction_times.module";

describe("DossiersController", () => {
  let controller: DossiersController;
  let service: DossiersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          load: [instructionTimeMappingConfig],
        }),
        InstructionTimesModule,
      ],
      controllers: [DossiersController],
      providers: [DossiersService],
    }).compile();

    controller = module.get<DossiersController>(DossiersController);
    service = module.get<DossiersService>(DossiersService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it.each`
    name                   | servicefn              | fn
    ${"findAll"}           | ${"findWithFilter"}    | ${() => controller.findAll()}
    ${"findOne"}           | ${"findOne"}           | ${() => controller.findOne("TEST")}
    ${"findOneWithDetail"} | ${"findOneWithDetail"} | ${() => controller.findOneWithDetail("TEST")}
    ${"search"}            | ${"findWithFilter"}    | ${() => controller.searchDossier({})}
  `("$name: should get dossiers ", async ({ servicefn, fn }) => {
    const result = ["dossiers"];
    jest.spyOn(service, servicefn).mockImplementation(() => result);
    expect(await fn()).toBe(result);
  });

  it("findAll: should throw error when there are nothing", async () => {
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

  it("search: should throw error when there are nothing", async () => {
    const result = [];
    jest
      .spyOn(service, "findWithFilter")
      .mockImplementation(async () => result);
    expect(await controller.searchDossier({})).toBe(result);
  });

  it.each`
    name                   | servicefn              | fn
    ${"findAll"}           | ${"findWithFilter"}    | ${() => controller.findAll()}
    ${"findOne"}           | ${"findOne"}           | ${() => controller.findOne("TEST")}
    ${"findOneWithDetail"} | ${"findOneWithDetail"} | ${() => controller.findOneWithDetail("TEST")}
    ${"search"}            | ${"findWithFilter"}    | ${() => controller.searchDossier({})}
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

  it.each`
    name                   | servicefn              | fn
    ${"findAll"}           | ${"findWithFilter"}    | ${() => controller.findAll()}
    ${"findOne"}           | ${"findOne"}           | ${() => controller.findOne("TEST")}
    ${"findOneWithDetail"} | ${"findOneWithDetail"} | ${() => controller.findOneWithDetail("TEST")}
    ${"search"}            | ${"findWithFilter"}    | ${() => controller.searchDossier({})}
  `(
    "$name: should throw error with message 'internal error' when there are unknown error",
    async ({ servicefn, fn }) => {
      jest.spyOn(service, servicefn).mockImplementation(() => {
        throw "Test Error";
      });
      await expect(fn).rejects.toThrow("Internal Server Error");
    },
  );
});
