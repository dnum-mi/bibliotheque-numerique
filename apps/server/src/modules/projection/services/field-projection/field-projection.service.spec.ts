import { Test, TestingModule } from '@nestjs/testing';
import { FieldProjectionService } from './field-projection.service';

describe('FieldProjectionService', () => {
  let service: FieldProjectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldProjectionService],
    }).compile();

    service = module.get<FieldProjectionService>(FieldProjectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
