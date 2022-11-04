import { Test, TestingModule } from '@nestjs/testing';
import { DossiersService } from './dossiers.service';

describe('DossiersService', () => {
  let service: DossiersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DossiersService],
    }).compile();

    service = module.get<DossiersService>(DossiersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
