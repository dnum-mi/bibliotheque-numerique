import { Test, TestingModule } from '@nestjs/testing'
import { DossierSynchroniseFileService } from '@/modules/dossiers/providers/synchronization/file/dossier-synchronize-file.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { loggerServiceMock } from '../../../../../../test/mock/logger-service.mock'
import { FileService } from '@/modules/files/providers/file.service'
import { FieldService } from '@/modules/dossiers/providers/field.service'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import { FieldType } from '@biblio-num/shared'
import {
  DossierState,
  DossierWithCustomChamp as TDossier,
} from '@dnum-mi/ds-api-client'
import { FieldCodeKey } from '@/modules/dossiers/objects/constante/field-code.enum'

//#region mock
const fileService: FileService = jest.createMockFromModule(
  '@/modules/files/providers/file.service',
)
const createIfNewMock = jest.fn().mockImplementation(async (p) => Promise.resolve(p))
let updateOrThrowMock = jest.fn().mockImplementation(async (p) => Promise.resolve(p))
FileService.computeLabelAndTag = jest.fn().mockReturnValue({
  label: 'test-label',
  tag: 'test-tag',
})
const fieldService: FileService = jest.createMockFromModule(
  '@/modules/dossiers/providers/field.service',
)
let addQueue: { name: string; payload: never }[] = []
const fileQueueAddMock = jest
  .fn()
  .mockImplementation((name: string, payload: never) => {
    const el = { name, payload }
    addQueue.push(el)
    return el
  })
//#endregion

//#region utils & factories
const dummyTDossierFactory = (status: DossierState): TDossier =>
  ({
    messages: [],
    annotations: [],
    state: status,
    number: 42,
    champs: [],
  }) as TDossier

const dummyFieldFactory = (
  code: FieldCodeKey,
  suggestedId = 'QsuperId',
): Field =>
  ({
    id: 37,
    code,
    type: FieldType.file,
    stringValue: 'dummy-url',
    dossierId: 1,
    sourceId: suggestedId,
    rawJson: {
      id: suggestedId,
      files: [
        {
          filename: 'toto.png',
        },
      ],
    },
  }) as unknown as Field
//#endregion

describe('DossierSynchroniseFileService', () => {
  let service: DossierSynchroniseFileService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [DossierSynchroniseFileService],
    })
      .useMocker((token) => {
        if (token === LoggerService) {
          return loggerServiceMock
        } else if (token === FileService) {
          return fileService
        } else if (token === FieldService) {
          return fieldService
        } else if (token === `BullQueue_${QueueName.file}`) {
          return {
            add: fileQueueAddMock,
          }
        }
      })
      .compile()
    service = module.get<DossierSynchroniseFileService>(
      DossierSynchroniseFileService,
    )
  })

  beforeEach(() => {
    fileService.createIfNew = createIfNewMock
    updateOrThrowMock = jest.fn().mockImplementation(async (p) => Promise.resolve(p))
    fieldService.updateOrThrow = updateOrThrowMock
    addQueue = []
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should not create file if only empty fields', async () => {
    await service.synchroniseFiles(
      [],
      dummyTDossierFactory(DossierState.Accepte) as TDossier,
      1,
      8,
    )
    expect(fileQueueAddMock).not.toHaveBeenCalled()
  })

  it('should not create file if only text fields', async () => {
    const fields = [
      { ...dummyFieldFactory('validated-account-at'), type: FieldType.string },
    ]
    await service.synchroniseFiles(
      fields,
      dummyTDossierFactory(DossierState.Accepte) as TDossier,
      1,
      8,
    )
    expect(fileService.createIfNew).not.toHaveBeenCalled()
    expect(updateOrThrowMock).not.toHaveBeenCalled()
    expect(fileQueueAddMock).not.toHaveBeenCalled()
  })

  it('should not create file from one file champs without files', async () => {
    const fields = [
      {
        ...dummyFieldFactory('file-abrited-account'),
        rawJson: { id: 'QsuperId', files: [] },
      } as unknown as Field,
    ]
    const dummyDossier = dummyTDossierFactory(DossierState.Accepte)
    await service.synchroniseFiles(fields, dummyDossier, 1, 8)
    expect(fileService.createIfNew).not.toHaveBeenCalled()
    expect(updateOrThrowMock).toHaveBeenCalledTimes(0)
    expect(fileQueueAddMock).not.toHaveBeenCalled()
  })

  it('should create file from one file field champ', async () => {
    const fields = [dummyFieldFactory('file-abrited-account')]
    const dummyDossier = dummyTDossierFactory(DossierState.Accepte)
    await service.synchroniseFiles(fields, dummyDossier, 1, 8)
    const expectedFilePayload = {
      dossierId: 1,
      label: 'test-label',
      tag: 'test-tag',
      sourceStringId: 'QsuperId',
      organismeId: 8,
      sourceIndex: 0,
      sourceLabel: 'ds-champ',
      originalLabel: 'toto.png',
    }
    expect(fileService.createIfNew).toHaveBeenCalledWith(expectedFilePayload)
    expect(updateOrThrowMock).toHaveBeenCalledTimes(1)
    expect(fileQueueAddMock).toHaveLastReturnedWith({
      name: 'UploadDsFile',
      payload: {
        file: expectedFilePayload,
        dsDossierId: 42,
        fieldId: fields[0].id,
        parentSourceId: undefined,
      },
    })
  })

  it('should create two files from one file field champ', async () => {
    const both: any[] = []
    fileService.createIfNew = jest.fn().mockImplementation(async (p) => {
      both.push(p)
      return Promise.resolve(p)
    })
    const fileChamps = dummyFieldFactory('file-abrited-account')
    // @ts-ignore test only
    fileChamps.rawJson.files = [
      { filename: 'toto.png' },
      { filename: 'tata.png' },
    ]
    const fields = [fileChamps]
    const dummyDossier = dummyTDossierFactory(DossierState.Accepte)
    await service.synchroniseFiles(fields, dummyDossier, 1, 8)
    const expectedFilePayloadFactory = (index) => ({
      dossierId: 1,
      sourceStringId: 'QsuperId',
      organismeId: 8,
      label: 'test-label',
      tag: 'test-tag',
      sourceIndex: index,
      sourceLabel: 'ds-champ',
      originalLabel: index ? 'tata.png' : 'toto.png',
    })

    const expectAddQueueFactory = (index): any => ({
      name: 'UploadDsFile',
      payload: {
        file: both[index],
        dsDossierId: 42,
        fieldId: fields[0].id,
        parentSourceId: undefined,
      },
    })

    expect(both).toEqual([
      expectedFilePayloadFactory(0),
      expectedFilePayloadFactory(1),
    ])
    expect(addQueue).toEqual([
      expectAddQueueFactory(0),
      expectAddQueueFactory(1),
    ])
    expect(updateOrThrowMock).toHaveBeenCalledTimes(2)
  })

  it('should create two files from repeatable field', async () => {
    const both: any[] = []
    fileService.createIfNew = jest.fn().mockImplementation(async (p) => {
      both.push(p)
      return Promise.resolve(p)
    })
    const fields = [
      {
        ...dummyFieldFactory('file-abrited-account', 'id1'),
        children: [{
          ...dummyFieldFactory('file-budget-account', 'id2'),
          id: 38,
          parentId: 37,
        }],
      } as unknown as Field,
    ]
    const dummyDossier = dummyTDossierFactory(DossierState.Accepte)
    await service.synchroniseFiles(fields, dummyDossier, 1, 8)
    const expectedFilePayloadFactory = (id) => ({
      dossierId: 1,
      sourceStringId: id,
      organismeId: 8,
      label: 'test-label',
      tag: 'test-tag',
      sourceIndex: 0,
      sourceLabel: 'ds-champ',
      originalLabel: 'toto.png',
    })

    const expectAddQueueFactory = (index): any => ({
      name: 'UploadDsFile',
      payload: {
        file: both[index],
        dsDossierId: 42,
        fieldId: index ? 38 : 37,
        parentSourceId: index ? 'id1' : undefined,
      },
    })

    expect(both).toEqual([
      expectedFilePayloadFactory('id1'),
      expectedFilePayloadFactory('id2'),
    ])
    expect(addQueue).toEqual([
      expectAddQueueFactory(0),
      expectAddQueueFactory(1),
    ])
    expect(updateOrThrowMock).toHaveBeenCalledTimes(2)
  })

  it('should create file from one file field champ without organismeId', async () => {
    const fields = [dummyFieldFactory('file-abrited-account')]
    const dummyDossier = dummyTDossierFactory(DossierState.EnConstruction)
    await service.synchroniseFiles(fields, dummyDossier, 1, 8)
    const expectedFilePayload = {
      dossierId: 1,
      label: 'test-label',
      tag: 'test-tag',
      sourceStringId: 'QsuperId',
      organismeId: undefined,
      sourceIndex: 0,
      sourceLabel: 'ds-champ',
      originalLabel: 'toto.png',
    }
    expect(fileService.createIfNew).toHaveBeenCalledWith(expectedFilePayload)
    expect(updateOrThrowMock).toHaveBeenCalledTimes(1)
    expect(fileQueueAddMock).toHaveLastReturnedWith({
      name: 'UploadDsFile',
      payload: {
        file: expectedFilePayload,
        dsDossierId: 42,
        fieldId: fields[0].id,
        parentSourceId: undefined,
      },
    })
  })

  it('should create file from message', async () => {
    const fields = []
    const dummyDossier = {
      ...dummyTDossierFactory(DossierState.Accepte),
      messages: [
        {
          id: 'useless',
        },
        {
          id: 'QsuperId',
          attachments: [{ filename: 'toto.png' }],
        },
      ],
    } as TDossier
    await service.synchroniseFiles(fields, dummyDossier, 1, 8)
    const expectedFilePayload = {
      dossierId: 1,
      sourceStringId: 'QsuperId',
      organismeId: 8,
      sourceIndex: 0,
      sourceLabel: 'ds-message',
      originalLabel: 'toto.png',
    }
    expect(fileService.createIfNew).toHaveBeenCalledWith(expectedFilePayload)
    expect(updateOrThrowMock).not.toHaveBeenCalled()
    expect(fileQueueAddMock).toHaveLastReturnedWith({
      name: 'UploadDsFile',
      payload: {
        file: expectedFilePayload,
        dsDossierId: 42,
        parentSourceId: undefined,
      },
    })
  })

  it('should create file from attestation', async () => {
    const fields = []
    const dummyDossier = {
      ...dummyTDossierFactory(DossierState.Accepte),
      attestation: { filename: 'toto.png' },
    } as TDossier
    await service.synchroniseFiles(fields, dummyDossier, 1, 8)
    const expectedFilePayload = {
      dossierId: 1,
      organismeId: 8,
      sourceLabel: 'ds-attestation',
      originalLabel: 'toto.png',
    }
    expect(fileService.createIfNew).toHaveBeenCalledWith(expectedFilePayload)
    expect(updateOrThrowMock).not.toHaveBeenCalled()
    expect(fileQueueAddMock).toHaveLastReturnedWith({
      name: 'UploadDsFile',
      payload: {
        file: expectedFilePayload,
        dsDossierId: 42,
        parentSourceId: undefined,
      },
    })
  })
})
