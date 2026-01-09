import { LoggerService } from '@/shared/modules/logger/logger.service'
import { FileBuilderService } from './file-builder.service'
import { Test, TestingModule } from '@nestjs/testing'
import { loggerServiceMock } from '../../../../../../test/mock/logger-service.mock'
import { File } from '@/modules/files/objects/entities/file.entity'
import { eFileExtension, eFileTag, eState } from '@biblio-num/shared'
import { fieldCourrierFileIntitule, fieldPjIntitule } from '@/modules/demarches/objects/constants/maarch-champ.dictionary'
import { createHash } from 'crypto'
import { ConfigService } from '@nestjs/config'

describe('FileBuilderService', () => {
  let service: FileBuilderService
  let logger: LoggerService
  let configService: ConfigService

  const MOCK_ROOT_PATH = 'import-maarch-pj'
  const MOCK_COURRIER_PATH = 'manual'
  const MOCK_PJ_PATH = 'manual_attachements'

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileBuilderService,
        {
          provide: LoggerService,
          useValue: loggerServiceMock,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'file.maarchImportFolderPieceJointe':
                  return MOCK_PJ_PATH
                case 'file.maarchImportFolderCourrier':
                  return MOCK_COURRIER_PATH
                case 'file.maarchImportRootPath':
                  return MOCK_ROOT_PATH
                default:
                  return null
              }
            }),
          },
        }
      ],
    }).compile()

    service = module.get<FileBuilderService>(FileBuilderService)
    logger = module.get<LoggerService>(LoggerService)
    configService = module.get<ConfigService>(ConfigService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createFileEntities', () => {
    it('should create file entities from valid pieces jointes data', () => {
      const data = {
        pieces_jointes: [
          {
            nom_pj: 'document.pdf',
            chemin_pj: '2024/01/folder',
            intitule_pj: 'Document - Statuts.pdf',
            date_creation_pj: new Date('2024-01-15'),
          },
          {
            nom_pj: 'rapport.docx',
            chemin_pj: '2024/02/folder',
            intitule_pj: 'Rapport - Annuel 2023.docx',
            date_creation_pj: new Date('2024-02-20'),
          },
        ],
        annotations: [],
      }

      const result = service.createFileEntities(data)

      expect(result).toHaveLength(2)

      const file1 = result[0]
      expect(file1).toBeInstanceOf(File)
      expect(file1.label).toBe('Document - Statuts.pdf')
      expect(file1.originalLabel).toBe('document.pdf')
      expect(file1.sourceUploadedAt).toEqual(new Date('2024-01-15'))
      expect(file1.mimeType).toBe(eFileExtension.pdf)
      expect(file1.state).toBe(eState.queued)
      expect(file1.sourcePath).toBe(
        `${MOCK_ROOT_PATH}/manual_attachements/2024/01/folder/document.pdf`
      )
      expect(file1.sourceLabel).toBe('rna')
      expect(file1.sourceStringId).toBe(fieldPjIntitule.id)

      const file2 = result[1]
      expect(file2.label).toBe('Rapport - Annuel 2023.docx')
      expect(file2.mimeType).toBe(eFileExtension.docx)
      expect(file2.sourcePath).toBe(
        `${MOCK_ROOT_PATH}/manual_attachements/2024/02/folder/rapport.docx`
      )
    })

    it('should create a file entity for the courrier HTML', () => {
      const data = {
        pieces_jointes: [],
        annotations: [],
        date_creation_courrier: new Date('2024-03-10'),
        nom_courrier: 'courrier_123.html',
        chemin_courrier: '2024/03/courriers',
        'n°5datedeclaration': new Date('2024-03-10'),
      }

      const result = service.createFileEntities(data)

      expect(result).toHaveLength(1)
      const courrier = result[0]

      expect(courrier).toBeInstanceOf(File)
      expect(courrier.originalLabel).toBe('courrier_123.pdf')
      expect(courrier.sourcePath).toBe(
        `${MOCK_ROOT_PATH}/manual/2024/03/courriers/courrier_123.pdf`
      )
      expect(courrier.sourceStringId).toBe(fieldCourrierFileIntitule.id)
      expect(courrier.state).toBe(eState.queued)
      expect(courrier.sourceUploadedAt).toEqual(new Date('2024-03-10'))
    })

    it('should combine pieces jointes and courrier', () => {
      const data = {
        pieces_jointes: [
          {
            nom_pj: 'pj1.pdf',
            chemin_pj: 'path/pj',
            intitule_pj: 'PJ 1',
          },
        ],
        nom_courrier: 'courrier.html',
        chemin_courrier: 'path/courrier',
        annotations: [],
      }

      const result = service.createFileEntities(data)

      expect(result).toHaveLength(2)
      const pj = result.find(f => f.originalLabel === 'pj1.pdf')
      expect(pj).toBeDefined()
      expect(pj?.sourcePath).toContain('/manual_attachements/')

      const courrier = result.find(f => f.originalLabel === 'courrier.pdf')
      expect(courrier).toBeDefined()
      expect(courrier?.sourcePath).toContain('/manual/')
    })

    it('should skip files without nom_pj OR chemin_pj', () => {
      const data = {
        pieces_jointes: [
          {
            nom_pj: 'valid.pdf',
            chemin_pj: 'valid/path',
            intitule_pj: 'Valid Document.pdf',
          },
          {
            nom_pj: null,
            chemin_pj: 'path',
            intitule_pj: 'No nom_pj',
          },
          {
            nom_pj: 'no_path.pdf',
            intitule_pj: 'No chemin_pj',
          },
          {
            nom_pj: '',
            chemin_pj: 'path',
            intitule_pj: 'Empty nom_pj',
          },
        ],
        annotations: [],
      }

      const result = service.createFileEntities(data)

      expect(result).toHaveLength(1)
      expect(result[0].originalLabel).toBe('valid.pdf')
    })

    it('should generate checksum based on label', () => {
      const label = 'Test Document.pdf'
      const hash = createHash('sha256')
      const expectedChecksum = hash.update(label).digest('hex')

      const data = {
        pieces_jointes: [
          {
            nom_pj: 'test.pdf',
            chemin_pj: 'path',
            intitule_pj: label,
          },
        ],
        annotations: [],
      }

      const result = service.createFileEntities(data)

      expect(result[0].checksum).toBe(expectedChecksum)
    })

    it('should handle missing intitule_pj with default label', () => {
      const data = {
        pieces_jointes: [
          {
            nom_pj: 'document.pdf',
            chemin_pj: 'path',
            intitule_pj: null,
          },
        ],
        annotations: [],
      }

      const result = service.createFileEntities(data)

      expect(result[0].label).toBe('unknown file')
    })

    it('should determine correct file tags', () => {
      const testCases = [
        {
          intitule: "Statuts de l'association.pdf",
          expectedTag: eFileTag.status,
        },
        { intitule: 'Autre document.pdf', expectedTag: eFileTag.other },
      ]

      testCases.forEach(({ intitule, expectedTag }) => {
        const data = {
          pieces_jointes: [
            {
              nom_pj: 'test.pdf',
              chemin_pj: 'path',
              intitule_pj: intitule,
            },
          ],
          annotations: [],
        }

        const result = service.createFileEntities(data)
        expect(result[0].tag).toBe(expectedTag)
      })
    })

    it('should set correct metadata for all files (state queued)', () => {
      const data = {
        pieces_jointes: [
          {
            nom_pj: 'test.pdf',
            chemin_pj: 'path',
            intitule_pj: 'Test Document.pdf',
            date_creation_pj: new Date('2024-01-15'),
          },
        ],
        annotations: [],
      }

      const result = service.createFileEntities(data)
      const file = result[0]

      expect(file.checksum).toBeDefined()
      expect(file.byteSize).toBe(0)
      expect(file.state).toBe(eState.queued)
      expect(file.sourcePath).toBe(
        `${MOCK_ROOT_PATH}/manual_attachements/path/test.pdf`
      )
    })

    it('should handle empty array of pieces jointes and no courrier', () => {
      const data = {
        pieces_jointes: [],
        annotations: [],
      }

      const result = service.createFileEntities(data)

      expect(result).toEqual([])
    })
  })
})
