import { Repository } from 'typeorm'
import { faker } from '@faker-js/faker'

import { eFileDsSourceLabel, eState, fileExtensions } from '@biblio-num/shared'
import { Champ, PieceJustificativeChamp, File as IFile } from '@dnum-mi/ds-api-client'

import { DossierService } from './dossier.service'
import { Dossier } from '../objects/entities/dossier.entity'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { getFakeDossierTest } from '../../../../test/unit/fake-data/dossier.fake-data'
import { File } from '../../files/objects/entities/file.entity'
import { FieldService } from '@/modules/dossiers/providers/field.service'

describe('dossier.service', () => {
  let service
  beforeAll(() => {
    const repository: Repository<Dossier> = jest.createMockFromModule('typeorm/repository/Repository')
    const loggerService: LoggerService = jest.createMockFromModule<LoggerService>('@/shared/modules/logger/logger.service')
    const fieldService: FieldService = jest.createMockFromModule<FieldService>('@/modules/dossiers/providers/field.service')
    loggerService.setContext = jest.fn()
    loggerService.verbose = jest.fn()

    service = new DossierService(repository, fieldService, loggerService)
  })

  it('Should have new value in url of files', () => {
    const generateDsFile = (): IFile => ({
      checksum: faker.string.alpha(),
      url: faker.internet.url(),
    } as IFile)
    const firstFile = generateDsFile()
    const pieceJustificativeChampMock:PieceJustificativeChamp = {
      __typename: 'PieceJustificativeChamp',
      id: faker.string.alphanumeric(),
      file: firstFile,
      files: [
        firstFile,
        generateDsFile(),
      ],
    } as PieceJustificativeChamp
    const champMock1: Champ = {
      __typename: 'Champ',
      id: faker.string.alphanumeric(),
      label: faker.string.alphanumeric(),
    }
    const dossierMock = getFakeDossierTest({
      champs: [
        champMock1,
        pieceJustificativeChampMock as Champ,
      ],
    })

    const generateFile = (index): File => ({
      sourceIndex: index,
      sourceLabel: eFileDsSourceLabel['ds-champ'],
      sourceStringId: pieceJustificativeChampMock.id,
      uuid: faker.string.uuid(),
    } as File)
    const filesMock: File[] = [
      {
        ...generateFile(1),
        checksum: pieceJustificativeChampMock.files[1].checksum,
      },
      {
        ...generateFile(0),
        checksum: pieceJustificativeChampMock.files[0].checksum,
      },
    ]
    const result = service.transformValueFileOfDossier(dossierMock, filesMock)
    expect(result.dsDataJson.champs[1].file.url).toBe(filesMock[1].uuid)
  })

})
