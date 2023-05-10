import { Test, TestingModule } from "@nestjs/testing";
import { DossiersService } from "./dossiers.service";
import { InstructionTimesModule } from "../plugins/instruction_time/instruction_times/instruction_times.module";
import { ConfigModule } from "@nestjs/config";
import instructionTimeMappingConfig from "../plugins/instruction_time/config/instructionTimeMapping.config";

describe("DossiersService", () => {
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
      providers: [DossiersService],
    }).compile();

    service = module.get<DossiersService>(DossiersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
