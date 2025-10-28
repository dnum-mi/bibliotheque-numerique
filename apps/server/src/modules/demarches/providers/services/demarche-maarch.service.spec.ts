import { DataSource, Repository } from 'typeorm'
import { DemarcheMaarchService } from './demarche-maarch.service'
import { CsvProcessorService } from './maarch/csv-processor.service'
import { Organisme } from '@/modules/organismes/objects/organisme.entity'
import { DossierTransformerService } from './maarch/dossier-transformer.service'
import { CustomBullService } from '@/shared/modules/custom-bull/custom-bull.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'
import { Demarche } from '../../objects/entities/demarche.entity'
import { Test, TestingModule } from '@nestjs/testing'
import { loggerServiceMock } from '../../../../../test/mock/logger-service.mock'
import { eIdentificationDemarche } from '@biblio-num/shared'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import {
  fieldNumRna,
  maarchFieldMappingsArray,
} from '../../objects/constants/maarch-champ.dictionary'
import { FileBuilderService } from './maarch/file-builder.service'

const mockCsvProcessor = {
  processFiles: jest.fn(),
};

const mockDossierTransformer = {
  transformToEntities: jest.fn(),
  updateFilesWithOrganisme: jest.fn(),
};

const mockCustomBullService = {
  addSyncOneRnaOrganismeJob: jest.fn(),
};

const mockFileBuilderService = {
  createFileEntities: jest.fn(),
}

const mockEntityManager = {
  getRepository: jest.fn().mockImplementation((entity) => {
    if (entity === Demarche) return mockDemarcheRepo;
    if (entity === Dossier) return mockDossierRepo;
    if (entity === Organisme) return mockOrganismeRepo;
  }),
};

const mockDataSource = {
  transaction: jest.fn().mockImplementation(async (callback) => {
    return callback(mockEntityManager);
  }),
};

const mockDemarcheRepo = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
};

const mockDossierRepo = {
  save: jest.fn(),
  delete: jest.fn(),
};

const mockOrganismeRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('DemarcheMaarchService', () => {
  let service: DemarcheMaarchService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DemarcheMaarchService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: LoggerService,
          useValue: loggerServiceMock,
        },
        {
          provide: CustomBullService,
          useValue: mockCustomBullService,
        },
        {
          provide: CsvProcessorService,
          useValue: mockCsvProcessor,
        },
        {
          provide: DossierTransformerService,
          useValue: mockDossierTransformer,
        },
        {
          provide: FileBuilderService,
          useValue: mockFileBuilderService,
        }
      ],
    }).compile()

    service = module.get<DemarcheMaarchService>(DemarcheMaarchService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  describe('importDemarches', () => {
    const mockFiles = {
      demandes: [{ buffer: Buffer.from('test') } as Express.Multer.File],
      annotations: [{ buffer: Buffer.from('test') } as Express.Multer.File],
    }
    const mockTitle = 'Test Import MAARCH'
    const mockDemarche = {
      id: 1,
      title: mockTitle,
      identification: eIdentificationDemarche.MAARCH,
      mappingColumns: maarchFieldMappingsArray,
      lastSynchronisedAt: expect.any(Date),
    }
    const mockDossier = { id: 101, fields: [{ sourceId: fieldNumRna.id, stringValue: 'W123456789' }] } as Dossier;

    const mockAggregatedData = [
      { courrier: 1, pieces_jointes: [], annotations: [] },
      { courrier: 2, pieces_jointes: [], annotations: [] },
    ]

    it('should successfully import a demarche and its dossiers', async () => {
      mockCsvProcessor.processFiles.mockReturnValue(mockAggregatedData);
      mockDemarcheRepo.create.mockReturnValue(mockDemarche);
      mockDemarcheRepo.save.mockResolvedValue(mockDemarche);
      mockDossierTransformer.transformToEntities.mockResolvedValue([mockDossier]);
      mockOrganismeRepo.findOne.mockResolvedValue(null);
      mockOrganismeRepo.create.mockReturnValue({ idRna: 'W123456789' } as Organisme);
      mockOrganismeRepo.save.mockResolvedValue({ id: 201, idRna: 'W123456789' } as Organisme);

      const result = await service.importDemarche(mockFiles, mockTitle)

      expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
      expect(mockCsvProcessor.processFiles).toHaveBeenCalledWith(mockFiles);
      expect(mockDemarcheRepo.save).toHaveBeenCalledWith(mockDemarche);
      expect(mockDossierTransformer.transformToEntities).toHaveBeenCalledWith(mockAggregatedData, mockDemarche);
      expect(mockOrganismeRepo.findOne).toHaveBeenCalledWith({ where: { idRna: 'W123456789' } });
      expect(mockOrganismeRepo.save).toHaveBeenCalledTimes(1); // Création de l'organisme
      expect(mockCustomBullService.addSyncOneRnaOrganismeJob).toHaveBeenCalledTimes(1);
      expect(mockDossierRepo.save).toHaveBeenCalledWith([mockDossier], { chunk: 100 });
      expect(result).toEqual({ demarcheId: 1, countDossiers: 1 });
    })

    it('should throw BadRequestException when no data is found in CSV files', async () => {
      mockCsvProcessor.processFiles.mockReturnValue([])

      await expect(
        service.importDemarche(
          {
            demandes: mockFiles.demandes,
            annotations: mockFiles.annotations
          },
          mockDemarche.title,
        ),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException when transformation produces no dossiers', async () => {
      mockCsvProcessor.processFiles.mockReturnValue(mockAggregatedData);
      mockDossierTransformer.transformToEntities.mockResolvedValue([]);
      mockDemarcheRepo.create.mockReturnValue(mockDemarche);
      mockDemarcheRepo.save.mockResolvedValue(mockDemarche);

      await expect(service.importDemarche(mockFiles, mockTitle)).rejects.toThrow(BadRequestException);
      expect(mockDossierRepo.save).not.toHaveBeenCalled();

    })
  })

  describe('rollbackImport', () => {
    const demarcheId = 1

    it('should successfully delete a demarche and its dossiers', async () => {
      mockDemarcheRepo.findOne.mockResolvedValue({ id: demarcheId } as Demarche);
      mockDossierRepo.delete.mockResolvedValue({ affected: 5 });

      const result = await service.deleteImport(demarcheId)

      expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
      expect(mockDemarcheRepo.findOne).toHaveBeenCalledWith({ where: { id: demarcheId } });
      expect(mockDossierRepo.delete).toHaveBeenCalledWith({ demarcheId });
      expect(mockDemarcheRepo.delete).toHaveBeenCalledWith(demarcheId);
      expect(result.message).toContain('Rollback successful!');
    })

    it('should throw NotFoundException if the demarche does not exist', async () => {
      mockDemarcheRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteImport(999)).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})
