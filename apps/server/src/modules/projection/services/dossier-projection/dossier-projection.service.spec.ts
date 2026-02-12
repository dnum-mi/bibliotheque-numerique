import { Test, TestingModule } from '@nestjs/testing';
import { DossierProjectionService } from './dossier-projection.service';

describe('DossierProjectionService', () => {
  let service: DossierProjectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DossierProjectionService],
    }).compile();

    service = module.get<DossierProjectionService>(DossierProjectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
