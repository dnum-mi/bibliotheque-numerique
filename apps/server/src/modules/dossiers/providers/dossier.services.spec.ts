import { Repository } from 'typeorm'
import { DossierService } from './dossier.service'
import { Dossier } from '../objects/entities/dossier.entity'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { getFakeDossierTest } from '../../../../test/unit/fake-data/dossier.fake-data'
import { PieceJustificativeChamp, File as IFile } from '@dnum-mi/ds-api-client'
import { faker } from '@faker-js/faker'
import { File } from '../../files/objects/entities/file.entity'
import { eFileDsSourceLabel, eState } from '@biblio-num/shared'
import { fileMimeTypes } from '@biblio-num/shared/src/files/enums/file-mime-type.enum'
import { Champ } from '@dnum-mi/ds-api-client/dist/@types/generated-types'

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
      mimeType: faker.helpers.arrayElement(fileMimeTypes),
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
      generateFile(1),
      generateFile(0),
    ]
    const result = service.transformValueFileOfDossier(dossierMock, filesMock)
    expect(result.dsDataJson.champs[1].file.url).toBe(filesMock[1].uuid)
  })
})
