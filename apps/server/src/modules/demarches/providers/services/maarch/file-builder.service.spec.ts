import { LoggerService } from '@/shared/modules/logger/logger.service'
import { FileBuilderService } from './file-builder.service'
import { Test, TestingModule } from '@nestjs/testing'
import { loggerServiceMock } from '../../../../../../test/mock/logger-service.mock'
import { File } from '@/modules/files/objects/entities/file.entity'
import { eFileExtension, eFileTag, eState } from '@biblio-num/shared'
import { fieldPiecesJointes, fieldPjIntitule } from '@/modules/demarches/objects/constants/maarch-champ.dictionary'
import { createHash } from 'crypto'

describe('FileBuilderService', () => {
  let service: FileBuilderService
  let logger: LoggerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileBuilderService,
        {
          provide: LoggerService,
          useValue: loggerServiceMock,
        },
      ],
    }).compile()

    service = module.get<FileBuilderService>(FileBuilderService)
    logger = module.get<LoggerService>(LoggerService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createFileEntities', () => {
    it('should create file entities from valid data', () => {
      const data = {
        pieces_jointes: [
          {
            nom_pj: 'document.pdf',
            intitule_pj: 'Document - Statuts.pdf',
            date_creation_pj: new Date('2024-01-15'),
          },
          {
            nom_pj: 'rapport.docx',
            intitule_pj: 'Rapport - Annuel 2023.docx',
            date_creation_pj: new Date('2024-02-20'),
          },
        ],
        annotations: [],
      }

      const result = service.createFileEntities(data)

      expect(result).toHaveLength(2)

      expect(result[0]).toBeInstanceOf(File)
      expect(result[0].label).toBe('Document - Statuts.pdf')
      expect(result[0].originalLabel).toBe('document.pdf')
      expect(result[0].sourceUploadedAt).toEqual(new Date('2024-01-15'))
      expect(result[0].mimeType).toBe(eFileExtension.pdf)
      expect(result[0].state).toBe(eState.uploaded)
      expect(result[0].sourceLabel).toBe('rna')
      expect(result[0].sourceStringId).toBe(fieldPjIntitule.id)
      expect(result[0].organismeId).toBeUndefined()

      expect(result[1].label).toBe('Rapport - Annuel 2023.docx')
      expect(result[1].mimeType).toBe(eFileExtension.docx)
      expect(result[1].organismeId).toBeUndefined()
    })

    it('should handle multiple files', () => {
      const data = {
        pieces_jointes: [
          {
            nom_pj: 'doc1.pdf',
            intitule_pj: 'Document 1.pdf',
          },
          {
            nom_pj: 'doc2.pdf',
            intitule_pj: 'Document 2.pdf',
          },
          {
            nom_pj: 'doc3.xlsx',
            intitule_pj: 'Tableau.xlsx',
          },
        ],
        annotations: [],
      }

      const result = service.createFileEntities(data)

      expect(result).toHaveLength(3)
    })

    it('should skip files without nom_pj', () => {
      const data = {
        pieces_jointes: [
          {
            nom_pj: 'valid.pdf',
            intitule_pj: 'Valid Document.pdf',
          },
          {
            nom_pj: null,
            intitule_pj: 'Invalid Document',
          },
          {
            intitule_pj: 'No nom_pj',
          },
          {
            nom_pj: '',
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
        { intitule: 'Compte rendu.pdf', expectedTag: eFileTag.activityReport },
        { intitule: 'PV assemblée.pdf', expectedTag: eFileTag.pv },
        { intitule: 'Procès verbal.pdf', expectedTag: eFileTag.pv },
        { intitule: 'Jugement tribunal.pdf', expectedTag: eFileTag.judgment },
        {
          intitule: 'Rapport activité.pdf',
          expectedTag: eFileTag.activityReport,
        },
        { intitule: 'Financement 2024.pdf', expectedTag: eFileTag.fe },
        { intitule: 'Autre document.pdf', expectedTag: eFileTag.other },
        { intitule: '', expectedTag: eFileTag.other },
      ]

      testCases.forEach(({ intitule, expectedTag }) => {
        const data = {
          pieces_jointes: [
            {
              nom_pj: 'test.pdf',
              intitule_pj: intitule,
            },
          ],
          annotations: [],
        }

        const result = service.createFileEntities(data)
        expect(result[0].tag).toBe(expectedTag)
      })
    })

    it('should extract correct file extensions', () => {
      const testCases = [
        { filename: 'document.pdf', expected: eFileExtension.pdf },
        { filename: 'image.png', expected: eFileExtension.png },
        { filename: 'photo.jpg', expected: eFileExtension.jpg },
        { filename: 'photo.jpeg', expected: eFileExtension.jpeg },
        { filename: 'document.doc', expected: eFileExtension.doc },
        { filename: 'document.docx', expected: eFileExtension.docx },
        { filename: 'spreadsheet.xls', expected: eFileExtension.xls },
        { filename: 'spreadsheet.xlsx', expected: eFileExtension.xlsx },
        { filename: 'unknown.txt', expected: eFileExtension.unknown },
        { filename: 'no_extension', expected: eFileExtension.unknown },
        { filename: '', expected: eFileExtension.unknown },
      ]

      testCases.forEach(({ filename, expected }) => {
        const data = {
          pieces_jointes: [
            {
              nom_pj: 'original.pdf',
              intitule_pj: filename,
            },
          ],
          annotations: [],
        }

        const result = service.createFileEntities(data)
        expect(result[0].mimeType).toBe(expected)
      })
    })

    it('should handle case insensitive file extensions', () => {
      const testCases = ['document.PDF', 'document.Pdf', 'document.pDf']

      testCases.forEach((filename) => {
        const data = {
          pieces_jointes: [
            {
              nom_pj: 'test.pdf',
              intitule_pj: filename,
            },
          ],
          annotations: [],
        }

        const result = service.createFileEntities(data)
        expect(result[0].mimeType).toBe(eFileExtension.pdf)
      })
    })

    it('should handle complex filenames with multiple dots', () => {
      const data = {
        pieces_jointes: [
          {
            nom_pj: 'test.pdf',
            intitule_pj: 'document.v2.final.pdf',
          },
        ],
        annotations: [],
      }

      const result = service.createFileEntities(data)

      expect(result[0].mimeType).toBe(eFileExtension.pdf)
      expect(result[0].label).toBe('document.v2.final.pdf')
    })

    it('should generate different checksums for different labels', () => {
      const data = {
        pieces_jointes: [
          {
            nom_pj: 'doc1.pdf',
            intitule_pj: 'Document 1.pdf',
          },
          {
            nom_pj: 'doc2.pdf',
            intitule_pj: 'Document 2.pdf',
          },
        ],
        annotations: [],
      }

      const result = service.createFileEntities(data)

      expect(result[0].checksum).not.toBe(result[1].checksum)
    })

    it('should handle special characters in filenames', () => {
      const specialFilename = 'Fichier avec espaces & caractères spéciaux!.pdf'
      const data = {
        pieces_jointes: [
          {
            nom_pj: 'test.pdf',
            intitule_pj: specialFilename,
          },
        ],
        annotations: [],
      }

      const result = service.createFileEntities(data)

      expect(result[0].label).toBe(specialFilename)
      expect(result[0].mimeType).toBe(eFileExtension.pdf)
    })

    it('should set correct metadata for all files', () => {
      const data = {
        pieces_jointes: [
          {
            nom_pj: 'test.pdf',
            intitule_pj: 'Test Document.pdf',
            date_creation_pj: new Date('2024-01-15'),
          },
        ],
        annotations: [],
      }

      const result = service.createFileEntities(data)
      const file = result[0]

      expect(file.checksum).toBeDefined()
      expect(file.checksum).not.toBe('unknown')
      expect(file.byteSize).toBe(0)
      expect(file.state).toBe(eState.uploaded)
      expect(file.sourceLabel).toBe('rna')
      expect(file.sourceStringId).toBe(fieldPjIntitule.id)
    })

    it('should handle empty array of pieces jointes', () => {
      const data = {
        pieces_jointes: [],
        annotations: [],
      }

      const result = service.createFileEntities(data)

      expect(result).toEqual([])
    })

    it('should handle mixed valid and invalid pieces jointes', () => {
      const data = {
        pieces_jointes: [
          {
            nom_pj: 'valid1.pdf',
            intitule_pj: 'Valid 1.pdf',
          },
          {
            nom_pj: null,
            intitule_pj: 'Invalid - no nom_pj',
          },
          {
            nom_pj: 'valid2.docx',
            intitule_pj: 'Valid 2.docx',
          },
          {
            nom_pj: '',
            intitule_pj: 'Invalid - empty nom_pj',
          },
          {
            nom_pj: 'valid3.xlsx',
            intitule_pj: 'Valid 3.xlsx',
          },
        ],
        annotations: [],
      }

      const result = service.createFileEntities(data)

      expect(result).toHaveLength(3)
      expect(result[0].originalLabel).toBe('valid1.pdf')
      expect(result[1].originalLabel).toBe('valid2.docx')
      expect(result[2].originalLabel).toBe('valid3.xlsx')
    })
  })
})
