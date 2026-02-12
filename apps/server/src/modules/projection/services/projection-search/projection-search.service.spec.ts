import { Test, TestingModule } from '@nestjs/testing';
import { ProjectionSearchService } from './projection-search.service';

describe('ProjectionSearchService', () => {
  let service: ProjectionSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectionSearchService],
    }).compile();

    service = module.get<ProjectionSearchService>(ProjectionSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
