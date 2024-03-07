import { Repository } from 'typeorm'
import { faker } from '@faker-js/faker'

import { eFileDsSourceLabel, eState, fileExtensions } from '@biblio-num/shared'
import { Champ, PieceJustificativeChamp, File as IFile } from '@dnum-mi/ds-api-client'

import { DossierService } from './dossier.service'
import { Dossier } from '../objects/entities/dossier.entity'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { getFakeDossierTest } from '../../../../test/unit/fake-data/dossier.fake-data'
import { File } from '../../files/objects/entities/file.entity'

describe('dossier.service', () => {
  let service
  beforeAll(() => {
    const repository: Repository<Dossier> = jest.createMockFromModule('typeorm/repository/Repository')
    const loggerService: LoggerService = jest.createMockFromModule<LoggerService>('@/shared/modules/logger/logger.service')
    loggerService.setContext = jest.fn()
    loggerService.verbose = jest.fn()

    service = new DossierService(repository, loggerService)
  })

  it('Should have new value in url of files', () => {
    const generateDsFile = (): IFile => ({
      byteSize: faker.number.int(),
      byteSizeBigInt: faker.number.bigInt(),
      checksum: faker.string.alpha(),
      contentType: faker.system.mimeType(),
      filename: faker.system.commonFileName(),
      url: faker.internet.url(),
    })
    const fistFile = generateDsFile()
    const champMock:PieceJustificativeChamp = {
      __typename: 'PieceJustificativeChamp',
      id: faker.string.alphanumeric(),
      label: faker.string.alphanumeric(),
      file: fistFile,
      files: [
        fistFile,
        generateDsFile(),
      ],
    }
    const champMock1: Champ = {
      __typename: 'Champ',
      id: faker.string.alphanumeric(),
      label: faker.string.alphanumeric(),
    }
    const dossierMock = getFakeDossierTest({
      champs: [
        champMock1,
        champMock as Champ,
      ],
    })

    const generateFile = (index): File => ({
      byteSize: faker.number.int(),
      checksum: faker.string.alphanumeric(),
      dossier: { id: faker.number.int() } as Dossier,
      createdAt: faker.date.past(),
      id: faker.number.int(),
      label: faker.string.alphanumeric(),
      mimeType: faker.helpers.arrayElement(fileExtensions),
      originalLabel: faker.string.alphanumeric(),
      sourceIndex: index,
      sourceLabel: eFileDsSourceLabel['ds-champ'],
      sourceStringId: champMock.id,
      uuid: faker.string.uuid(),
      organisme: null,
      sourceUploadedAt: faker.date.anytime(),
      state: eState.queued,
      tag: null,
      updatedAt: faker.date.anytime(),
    })
    const filesMock: File[] = [
      {
        ...generateFile(1),
        checksum: champMock.files[1].checksum,
      },
      {
        ...generateFile(0),
        checksum: champMock.files[0].checksum,
      },
    ]
    const result = service.transformValueFileOfDossier(dossierMock, filesMock)
    expect(result.dsDataJson.champs[1].file.url).toBe(filesMock[1].uuid)
  })
})
