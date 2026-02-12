import { Test, TestingModule } from '@nestjs/testing';
import { ProjectionManagerService } from './projection-manager.service';

describe('ProjectionManagerService', () => {
  let service: ProjectionManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectionManagerService],
    }).compile();

    service = module.get<ProjectionManagerService>(ProjectionManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
