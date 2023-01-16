import { Test, TestingModule } from "@nestjs/testing";
import { InstructionTimesService } from "./instruction_times.service";

describe("InstructionTimesService", () => {
  let service: InstructionTimesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstructionTimesService],
    }).compile();

    service = module.get<InstructionTimesService>(InstructionTimesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
