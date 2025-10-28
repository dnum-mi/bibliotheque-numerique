import { Test, TestingModule } from "@nestjs/testing"
import { CsvProcessorService } from "./csv-processor.service"
import { DataFormatterService } from "./data-formatter.service"
import { LoggerService } from "@/shared/modules/logger/logger.service"
import { loggerServiceMock } from "../../../../../../test/mock/logger-service.mock"
import { BadRequestException } from "@nestjs/common"

describe('CsvProcessorService', () => {
  let service: CsvProcessorService
  let dataFormatter: DataFormatterService
  let logger: LoggerService

  const mockDataFormatter = {
    formatPhoneNumber: jest.fn((phone) => phone),
    getPrefectureKey: jest.fn((pref) => pref),
    getStatus: jest.fn((status) => status),
    parseDate: jest.fn((date) => new Date(date)),
    parseBoolean: jest.fn((bool) => bool === 'oui'),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsvProcessorService,
        {
          provide: LoggerService,
          useValue: loggerServiceMock
        },
        {
          provide: DataFormatterService,
          useValue: mockDataFormatter
        }
      ]
    }).compile()

    service = module.get<CsvProcessorService>(CsvProcessorService)
    dataFormatter = module.get<DataFormatterService>(DataFormatterService)
    logger = module.get<LoggerService>(LoggerService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('processFiles', () => {
    const createMockFile = (content: string): Express.Multer.File => ({
      buffer: Buffer.from(content),
      originalname: 'test.csv',
      encoding: 'utf-8',
      mimetype: 'text/csv',
      size: content.length,
      fieldname: 'file',
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    })

    it('should process valid CSV files successfully', () => {
      const demandesContent = `courrier;etat_dossier;nom_pj;intitule_pj;date_creation_pj;tél;prefecture
1;REJ;document.pdf;Statuts;2024-01-15;0123456789;D75
2;VAL;rapport.doc;Rapport annuel;2024-02-20;0987654321;D92`

      const annotationsContent = `res_id;annotations_courrier
1;Annotation pour dossier 1
1;Autre annotation dossier 1
2;Annotation pour dossier 2`

      const mockFiles = {
        demandes: [createMockFile(demandesContent)],
        annotations: [createMockFile(annotationsContent)],
      }

      const result = service.processFiles(mockFiles)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        courrier: '1',
        pieces_jointes: expect.arrayContaining([
          expect.objectContaining({
            nom_pj: 'document.pdf',
            intitule_pj: 'document_Statuts.pdf',
          }),
        ]),
        annotations: ['Annotation pour dossier 1', 'Autre annotation dossier 1'],
      })
      expect(result[1]).toMatchObject({
        courrier: '2',
        pieces_jointes: expect.arrayContaining([
          expect.objectContaining({
            nom_pj: 'rapport.doc',
            intitule_pj: 'rapport_Rapport annuel.doc',
          }),
        ]),
        annotations: ['Annotation pour dossier 2'],
      })
    })

    it('should throw BadRequestException when res_id column is missing', () => {
      const demandesContent = `courrier;etat_dossier;nom
1;VAL,test`
      const annotationsContent = `wrong_column;annotations_courrier
1;Annotation`

      const mockFiles = {
        demandes: [createMockFile(demandesContent)],
        annotations: [createMockFile(annotationsContent)],
      }

      expect(() => service.processFiles(mockFiles)).toThrow(
        new BadRequestException('Annotations file must contain a "res_id" column.')
      )
    })

    it('should throw BadRequestException when courrier column is missing', () => {
      const demandesContent = `wrong_column;nom
1;test`
      const annotationsContent = `res_id;annotations_courrier
1;Annotation`

      const mockFiles = {
        demandes: [createMockFile(demandesContent)],
        annotations: [createMockFile(annotationsContent)],
      }

      expect(() => service.processFiles(mockFiles)).toThrow(
        new BadRequestException('Demandes file must contain a "courrier" column.')
      )
    })

    it('should handle multiple pieces jointes for same courrier', () => {
      const demandesContent = `courrier;etat_dossier;nom_pj;intitule_pj
1;VAL;doc1.pdf;Document 1
1;VAL;doc2.pdf;Document 2
1;VAL;doc3.xlsx;Tableau`

      const annotationsContent = `res_id;annotations_courrier
1;Annotation`

      const mockFiles = {
        demandes: [createMockFile(demandesContent)],
        annotations: [createMockFile(annotationsContent)],
      }

      const result = service.processFiles(mockFiles)

      expect(result).toHaveLength(1)
      expect(result[0].pieces_jointes).toHaveLength(3)
      expect(result[0].pieces_jointes[0].intitule_pj).toBe('doc1_Document 1.pdf')
      expect(result[0].pieces_jointes[1].intitule_pj).toBe('doc2_Document 2.pdf')
      expect(result[0].pieces_jointes[2].intitule_pj).toBe('doc3_Tableau.xlsx')
    })

    it('should format phone numbers and parse dates correctly', () => {
      const demandesContent = `courrier;etat_dossier;tél;date_creation_courrier;n°5_association_union_fédération;nom_pj;intitule_pj
1;VAL;0612345678;2024-01-15;oui;file.pdf;Test`

      const annotationsContent = `res_id;annotations_courrier
1;Note`

      const mockFiles = {
        demandes: [createMockFile(demandesContent)],
        annotations: [createMockFile(annotationsContent)],
      }

      mockDataFormatter.formatPhoneNumber.mockReturnValue('06 12 34 56 78')
      mockDataFormatter.parseDate.mockReturnValue(new Date('2024-01-15'))
      mockDataFormatter.parseBoolean.mockReturnValue(true)

      const result = service.processFiles(mockFiles)

      expect(mockDataFormatter.formatPhoneNumber).toHaveBeenCalledWith('0612345678')
      expect(mockDataFormatter.parseDate).toHaveBeenCalled()
      expect(mockDataFormatter.parseBoolean).toHaveBeenCalledWith('oui')
      expect(result[0]["tél"]).toBe('06 12 34 56 78')
    })

    it('should handle files without extension correctly', () => {
      const demandesContent = `courrier;etat_dossier;nom_pj;intitule_pj
1;VAL;document_sans_extension;Fichier important`

      const annotationsContent = `res_id;annotations_courrier
1;Note`

      const mockFiles = {
        demandes: [createMockFile(demandesContent)],
        annotations: [createMockFile(annotationsContent)],
      }

      const result = service.processFiles(mockFiles)

      expect(result[0].pieces_jointes[0].intitule_pj).toBe(
        'document_sans_extension_Fichier important'
      )
    })

    it('should skip rows with invalid courrier ID', () => {
      const demandesContent = `courrier;etat_dossier;nom_pj;intitule_pj
invalid;VAL;doc.pdf;Document
1;VAL;valid.pdf;Valid Document
NaN;VAL;other.pdf;Other`

      const annotationsContent = `res_id;annotations_courrier
1;Annotation`

      const mockFiles = {
        demandes: [createMockFile(demandesContent)],
        annotations: [createMockFile(annotationsContent)],
      }

      const result = service.processFiles(mockFiles)

      expect(result).toHaveLength(1)
      expect(result[0].courrier).toBe('1')
    })

    it('should handle empty piece jointe columns', () => {
      const demandesContent = `courrier;etat_dossier;autre_colonne
1;VAL;valeur`

      const annotationsContent = `res_id;annotations_courrier
1;Note`

      const mockFiles = {
        demandes: [createMockFile(demandesContent)],
        annotations: [createMockFile(annotationsContent)],
      }

      const result = service.processFiles(mockFiles)

      expect(result).toHaveLength(1)
      expect(result[0].pieces_jointes).toHaveLength(0)
    })
  })
})
