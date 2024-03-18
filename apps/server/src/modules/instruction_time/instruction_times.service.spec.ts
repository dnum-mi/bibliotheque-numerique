/* eslint-disable */
import { ConfigService } from '@nestjs/config'
import { Champ, DossierState } from '@dnum-mi/ds-api-client/dist/@types/types'
import { Repository } from 'typeorm/repository/Repository'
import { faker } from '@faker-js/faker/locale/fr'
import MockDate from 'mockdate'

import dayjs from '../../shared/utils/dayjs'

import { InstructionTimesService } from './instruction_times.service'

import { EInstructionTimeState } from './types/IntructionTime.type'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'
import { InstructionTime } from './instruction_time.entity'
import { getFakeDossierTest } from '../../../test/unit/fake-data/dossier.fake-data'
import { DossierService } from '@/modules/dossiers/providers/dossier.service'
import { FieldService } from '@/modules/dossiers/providers/field.service'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import {
  fixFieldInstructionTimeDelay,
  fixFieldInstructionTimeStatus,
} from './constante/fix-field-instrucation-times.dictionnary'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { FieldSource, FieldType } from '@biblio-num/shared'
import { DsChampType } from '../../shared/modules/ds-api/objects/ds-champ-type.enum'
import { InstructionTimeCodeKey, eInstructionTimeCode } from '../dossiers/objects/constante/field-code.enum'
import instructionTimeMappingConfig from '../../config/instructionTimeMapping.config'



const loggerService: LoggerService = jest.createMockFromModule<LoggerService>('@/shared/modules/logger/logger.service')
loggerService.setContext = jest.fn()
loggerService.verbose = jest.fn()
loggerService.error = jest.fn()

const configService: ConfigService = jest.createMockFromModule('@nestjs/config/dist/config.service')
configService.get = jest.fn().mockImplementation(instructionTimeMappingConfig)

const dossierService: DossierService = jest.createMockFromModule('@/modules/dossiers/providers/dossier.service')

const fieldService: FieldService = jest.createMockFromModule('@/modules/dossiers/providers/field.service')

const repository: Repository<InstructionTime> = jest.createMockFromModule('typeorm/repository/Repository')
repository.save = jest.fn().mockImplementation(async (elt) => {
  return elt
})
// @ts-ignore
const instructionTimeMappingConfigLabel:Record<InstructionTimeCodeKey, string> =  {
    [eInstructionTimeCode['first-demand-at']]: 'Date de la première demande de pièces',
    [eInstructionTimeCode['first-demand-recieved-at']]: 'Date de réception des pièces de la première demande',
    [eInstructionTimeCode['extention-began-at']]: 'Date de début de prorogation',
    [eInstructionTimeCode['nb-days-extension']]: 'Durée de la prorogation',
    [eInstructionTimeCode['second-demand-at']]: 'Date de deuxième demande de pièces complémentaires',
    [eInstructionTimeCode['second-demand-recieved-at']]: 'Date de réception des pièces de la deuxième demande',
    [eInstructionTimeCode['intent-to-oppose-at']]: "Date de l'intention d'opposition aux financements",
  }
// @ts-ignore
const mappingLabelToCode:Record<string, InstructionTimeCodeKey> = Object.fromEntries(Object.entries(instructionTimeMappingConfigLabel).map(
  ([key,label])=> [label, key]
))

  function mockFields(annotations: (Champ & { date?: string, datetime?: string})[], idDossier) {
    let id=0
    if(!annotations) {
      fieldService.findWithFilter = jest.fn().mockResolvedValue([])
      return
    }
    const fakefields:Field[] = annotations.map((a, idx) => ({
      id: idx+1,
      dateValue: ((a.date || a.datetime) && new Date(a.date || a.datetime)) || null,
      label: a.label,
      code: mappingLabelToCode[a.label] || null,

      fieldSource: FieldSource.annotation,
      dsChampType: DsChampType.DateChamp,
      type: FieldType.date,
      formatFunctionRef: null,
      sourceId: faker.string.uuid(),
      stringValue: "",
      numberValue: null,
      parentId: null,
      parentRowIndex: null,
      rawJson: {},
      dossierId: idDossier,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    fieldService.findWithFilter = jest.fn().mockResolvedValue(fakefields)
  }


describe('InstructionTimesService', () => {
  let service: InstructionTimesService

  beforeAll(async () => {
    service = new InstructionTimesService(
      configService,
      loggerService,
      dossierService,
      repository,
      fieldService
        )
  })

  afterEach(async () => {
    MockDate.reset()
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('It should return good annotations', async () => {
    const fakeDossier = getFakeDossierTest(null)
    let id=0
    const fakefields:Field[] = [
        {
          id: ++id,
          dateValue: new Date('2021-02-01T05:00:00.000Z'),
          label: instructionTimeMappingConfigLabel['first-demand-recieved-at'],
          code: eInstructionTimeCode['first-demand-recieved-at']
        },
        {
          id: ++id,
          dateValue: new Date('2021-04-02T05:00:00.000Z'),
          label: instructionTimeMappingConfigLabel['second-demand-recieved-at'],
          code: eInstructionTimeCode['second-demand-recieved-at'],
        },
        {
          id: ++id,
          dateValue: new Date('2021-01-01T05:00:00.000Z'),
          label: instructionTimeMappingConfigLabel['first-demand-at'],
          code: eInstructionTimeCode['first-demand-at']
        },
        {
          id: ++id,
          dateValue: new Date('2021-03-15T05:00:00.000Z'),
          label: instructionTimeMappingConfigLabel['second-demand-at'],
          code: eInstructionTimeCode['second-demand-at']
        },
        {
          id: ++id,
          dateValue: new Date('2021-07-01T00:00:00.000Z'),
          label: instructionTimeMappingConfigLabel['nb-days-extension'],
          code: eInstructionTimeCode['nb-days-extension']
        },
        {
          id: ++id,
          dateValue: new Date('2021-03-15T05:00:00.000Z'),
          label: instructionTimeMappingConfigLabel['intent-to-oppose-at'],
          code: eInstructionTimeCode['intent-to-oppose-at']
        },
      ].map(f => ({
        ...f,
        fieldSource: FieldSource.annotation,
        dsChampType: DsChampType.DateChamp,
        type: FieldType.date,
        formatFunctionRef: null,
        sourceId: faker.string.uuid(),
        stringValue: "",
        numberValue: null,
        parentId: null,
        parentRowIndex: null,
        rawJson: {},
        dossierId: fakeDossier.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))


    fieldService.findWithFilter = jest.fn().mockResolvedValue(fakefields)
    expect(
      await service.getMappingInstructionTimeByDossierId(fakeDossier.id),
    ).toEqual({
      [eInstructionTimeCode['extention-began-at']]: null,

      [eInstructionTimeCode['first-demand-recieved-at']]: dayjs('2021-02-01T00:00:00.000Z').startOf('day').toDate(),
      [eInstructionTimeCode['second-demand-recieved-at']]: dayjs('2021-04-02T00:00:00.000Z').startOf('day').toDate(),
      [eInstructionTimeCode['first-demand-at']]: dayjs('2021-01-01T00:00:00.000Z').startOf('day').toDate(),
      [eInstructionTimeCode['second-demand-at']]: dayjs('2021-03-15T00:00:00.000Z').startOf('day').toDate(),
      [eInstructionTimeCode['nb-days-extension']]: dayjs('2021-07-01T00:00:00.000Z')
        .startOf('day')
        .toDate(),
      [eInstructionTimeCode['intent-to-oppose-at']]: dayjs('2021-03-15T00:00:00.000Z')
        .startOf('day')
        .toDate(),
    })
  })

  it('It should return good times instruction for a list a dossiers', async () => {
    const fakeInstrunctionTime: Partial<InstructionTime>[] = Array.from(
      { length: 3 },
      (elt, idx) => {
        const dossier = getFakeDossierTest(null)
        dossier.id = idx + 1

        if (dossier.id === 2) {
          dossier.dsDataJson.state = DossierState.EnConstruction
          dossier.dsDataJson.annotations = [
            {
              id: faker.string.uuid(),
              date: '2021-02-01',
              label: instructionTimeMappingConfigLabel['first-demand-at'],
            },
          ] as any

          return {
            dossier,
            state: EInstructionTimeState.FIRST_REQUEST,
          } as InstructionTime
        }
        return {
          dossier,
        } as InstructionTime
      },
    )

    const results = {}
    const mockUpsert = jest.fn()
      .mockImplementation(async (obj: Field): Promise<Field[]> => {
        results[obj.sourceId] = obj
        return [new Field()]
      })
    fieldService.upsert = mockUpsert
    service.repository.find = jest.fn()
      .mockResolvedValueOnce(fakeInstrunctionTime as InstructionTime[])

    await service.instructionTimeCalculation(
      fakeInstrunctionTime.map((d) => d.dossier.id),
    )

    expect(mockUpsert).toBeCalledTimes(1)

    expect(results[fixFieldInstructionTimeStatus.id]).toMatchObject({
      sourceId: fixFieldInstructionTimeStatus.id,
      dossierId: 2,
      stringValue: '1ère demande',
      label: fixFieldInstructionTimeStatus.originalLabel,
      type: fixFieldInstructionTimeStatus.type,
      fieldSource: fixFieldInstructionTimeStatus.source,
    })
  })

  const millisecondsOfDay = 24 * 60 * 60 * 1000

  function getDataTestInstructionTime(idx) {
    const datas = {
      ['In closure']: {
        expected: {
          state: EInstructionTimeState.DEFAULT,
        },
        dossier: {
          state: DossierState.Accepte,
        },
      },

      ['In building']: {
        expected: {
          state: EInstructionTimeState.DEFAULT,
        },
        dossier: {
          state: DossierState.EnConstruction,
        },
      },

      ['In first demand']: {
        expected: {
          state: EInstructionTimeState.FIRST_REQUEST,
        },
        dossier: {
          state: DossierState.EnConstruction,
          annotations: [
            {
              id: faker.string.uuid(),
              date: '2023-01-01',
              label: instructionTimeMappingConfigLabel['first-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: null,
              label: instructionTimeMappingConfigLabel['extention-began-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['second-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['second-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['intent-to-oppose-at'],
            },
          ],
        },
      },

      ['In instruction without 1st demand']: {
        expected: {
          state: EInstructionTimeState.IN_PROGRESS,
          delay: 60,
          now: '2023-01-01',
          endAt: new Date(
            new Date('2023-01-01').getTime() + 60 * millisecondsOfDay,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: '2023-01-01',
          annotations: [
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: null,
              label: instructionTimeMappingConfigLabel['extention-began-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['second-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['second-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['intent-to-oppose-at'],
            },
          ],
        },
      },
      ['In instruction without 1st demand next day']: {
        expected: {
          state: EInstructionTimeState.IN_PROGRESS,
          delay: 55,
          now: '2023-01-06',
          endAt: new Date(
            new Date('2023-01-01').getTime() + 60 * millisecondsOfDay,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: '2023-01-01',
          annotations: [
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: null,
              label: instructionTimeMappingConfigLabel['extention-began-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['second-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['second-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['intent-to-oppose-at'],
            },
          ],
        },
      },
      ['In instruction']: {
        expected: {
          state: EInstructionTimeState.IN_PROGRESS,
          delay: 59,
          now: '2023-01-06',
          endAt: new Date(
            new Date('2023-01-05').getTime() + 60 * millisecondsOfDay,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: '2023-01-05',
          annotations: [
            {
              id: faker.string.uuid(),
              date: '2023-01-01',
              label: instructionTimeMappingConfigLabel['first-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: '2023-01-05',
              label: instructionTimeMappingConfigLabel['first-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: null,
              label: instructionTimeMappingConfigLabel['extention-began-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['second-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['second-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['intent-to-oppose-at'],
            },
          ],
        },
      },

      ['In instruction 2']: {
        expected: {
          state: EInstructionTimeState.IN_PROGRESS,
          delay: 59,
          now: '2023-01-06',
          endAt: new Date(
            new Date('2023-01-05').getTime() + 60 * millisecondsOfDay,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: '2023-01-06',
          annotations: [
            {
              id: faker.string.uuid(),
              date: '2023-01-01',
              label: instructionTimeMappingConfigLabel['first-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: '2023-01-05',
              label: instructionTimeMappingConfigLabel['first-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: null,
              label: instructionTimeMappingConfigLabel['extention-began-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['second-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['second-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['intent-to-oppose-at'],
            },
          ],
        },
      },

      ['In instruction, out of date']: {
        expected: {
          state: EInstructionTimeState.OUT_OF_DATE,
          delay: undefined,
          now: '2023-03-09',
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: '2023-01-06',
          annotations: [
            {
              id: faker.string.uuid(),
              date: '2023-01-01',
              label: instructionTimeMappingConfigLabel['first-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: '2023-01-05',
              label: instructionTimeMappingConfigLabel['first-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: null,
              label: instructionTimeMappingConfigLabel['extention-began-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['second-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['second-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['intent-to-oppose-at'],
            },
          ],
        },
      },

      ['In extention']: {
        expected: {
          state: EInstructionTimeState.IN_EXTENSION,
          delay: 166,
          now: '2023-01-20',
          endAt: new Date(
            new Date('2023-01-06').getTime() + 180 * millisecondsOfDay,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: '2023-01-06',
          annotations: [
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: '2023-01-20',
              label: instructionTimeMappingConfigLabel['extention-began-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['second-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['second-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['intent-to-oppose-at'],
            },
          ],
        },
      },

      ['In extention, out of date']: {
        expected: {
          state: EInstructionTimeState.OUT_OF_DATE,
          delay: 166,
          now: '2023-07-06',
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: '2023-01-06',
          annotations: [
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: '2023-01-20',
              label: instructionTimeMappingConfigLabel['extention-began-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['second-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['second-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['intent-to-oppose-at'],
            },
          ],
        },
      },

      ['In second demand']: {
        expected: {
          state: EInstructionTimeState.SECOND_REQUEST,
          delay: 164,
          now: '2023-01-22',
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: '2023-01-06',
          annotations: [
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              date: '2023-01-20',
              label: instructionTimeMappingConfigLabel['extention-began-at'],
            },
            {
              id: faker.string.uuid(),
              date: '2023-01-22',
              label: instructionTimeMappingConfigLabel['second-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['second-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['intent-to-oppose-at'],
            },
          ],
        },
      },

      ['In second demand 2']: {
        expected: {
          state: EInstructionTimeState.SECOND_REQUEST,
          delay: 164,
          now: '2023-01-24',
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: '2023-01-06',
          annotations: [
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: '2023-01-20',
              label: instructionTimeMappingConfigLabel['extention-began-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: '2023-01-22',
              label: instructionTimeMappingConfigLabel['second-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['second-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['intent-to-oppose-at'],
            },
          ],
        },
      },

      ['In second reciept']: {
        expected: {
          state: EInstructionTimeState.SECOND_RECEIPT,
          delay: 164,
          now: '2023-01-25',
          endAt: new Date(
            new Date('2023-01-25').getTime() + 164 * millisecondsOfDay,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: '2023-01-06',
          annotations: [
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: '2023-01-20',
              label: instructionTimeMappingConfigLabel['extention-began-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: '2023-01-22',
              label: instructionTimeMappingConfigLabel['second-demand-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: '2023-01-25',
              label: instructionTimeMappingConfigLabel['second-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['intent-to-oppose-at'],
            },
          ],
        },
      },

      ['In second reciept 2']: {
        expected: {
          state: EInstructionTimeState.SECOND_RECEIPT,
          delay: 163,
          now: '2023-01-26',
          endAt: new Date(
            new Date('2023-01-26').getTime() + 163 * millisecondsOfDay,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: '2023-01-06',
          annotations: [
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: '2023-01-20',
              label: instructionTimeMappingConfigLabel['extention-began-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: '2023-01-22',
              label: instructionTimeMappingConfigLabel['second-demand-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: '2023-01-25',
              label: instructionTimeMappingConfigLabel['second-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['intent-to-oppose-at'],
            },
          ],
        },
      },

      ['In second reciept, out of date']: {
        expected: {
          state: EInstructionTimeState.OUT_OF_DATE,
          now: '2023-07-10',
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: '2023-01-06',
          annotations: [
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: '2023-01-20',
              label: instructionTimeMappingConfigLabel['extention-began-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: '2023-01-22',
              label: instructionTimeMappingConfigLabel['second-demand-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: '2023-01-25',
              label: instructionTimeMappingConfigLabel['second-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['intent-to-oppose-at'],
            },
          ],
        },
      },

      ['In opposition']: {
        expected: {
          state: EInstructionTimeState.INTENT_OPPO,
          // now: "2023-07-10",
          delay: 30,
          now: '2023-01-28',
          endAt: new Date(
            new Date('2023-01-28').getTime() + 30 * millisecondsOfDay,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: '2023-01-06',
          annotations: [
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: '2023-01-20',
              label: instructionTimeMappingConfigLabel['extention-began-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: '2023-01-22',
              label: instructionTimeMappingConfigLabel['second-demand-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: '2023-01-25',
              label: instructionTimeMappingConfigLabel['second-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              date: '2023-01-28',
              label: instructionTimeMappingConfigLabel['intent-to-oppose-at'],
            },
          ],
        },
      },

      ['In opposition in out of date']: {
        expected: {
          state: EInstructionTimeState.INTENT_OPPO,
          // now: "2023-07-10",
          delay: -2,
          now: '2023-03-01',
          endAt: new Date(
            new Date('2023-01-28').getTime() + 30 * millisecondsOfDay,
          ),
        },
        dossier: {
          state: DossierState.EnInstruction,
          datePassageEnInstruction: '2023-01-06',
          annotations: [
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-at'],
            },
            {
              id: faker.string.uuid(),
              date: null,
              label: instructionTimeMappingConfigLabel['first-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: '2023-01-20',
              label: instructionTimeMappingConfigLabel['extention-began-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: '2023-01-22',
              label: instructionTimeMappingConfigLabel['second-demand-at'],
            },
            {
              id: faker.string.uuid(),
              datetime: '2023-01-25',
              label: instructionTimeMappingConfigLabel['second-demand-recieved-at'],
            },
            {
              id: faker.string.uuid(),
              date: '2023-01-28',
              label: instructionTimeMappingConfigLabel['intent-to-oppose-at'],
            },
          ],
        },
      },
    }
    return datas[idx]
  }

  it.each`
    cas
    ${'In closure'}
    ${'In building'}
    ${'In first demand'}
    ${'In instruction'}
    ${'In instruction 2'}
    ${'In instruction, out of date'}
    ${'In extention'}
    ${'In extention, out of date'}
    ${'In second demand'}
    ${'In second demand 2'}
    ${'In second reciept'}
    ${'In second reciept 2'}
    ${'In second reciept, out of date'}
    ${'In opposition'}
    ${'In instruction without 1st demand'}
    ${'In instruction without 1st demand next day'}
    ${'In opposition in out of date'}
  `(
    'cas $cas: Should create ou update of instruction time',
    async ({ cas }) => {
      const data = getDataTestInstructionTime(cas)

      const instructionTime = new InstructionTime()
      instructionTime.dossier = new Dossier()
      instructionTime.dossier.dsDataJson = getFakeDossierTest(null).dsDataJson
      instructionTime.dossier.dsDataJson = data.dossier

      mockFields(data.dossier.annotations, data.dossier.id)

      if (data.expected.now) {
        MockDate.set(data.expected.now)
      }
      const result = await service.proccess(instructionTime)
      expect(result).toHaveProperty(
        'state',
        data.expected.state || EInstructionTimeState.DEFAULT,
      )

      if (
        typeof result !== 'boolean' &&
        [
          EInstructionTimeState.IN_PROGRESS,
          EInstructionTimeState.IN_EXTENSION,
          EInstructionTimeState.INTENT_OPPO,
        ].includes(data.expected.state)
      ) {
        const recieveDelay = dayjs(result?.endAt).diff(data.expected.now, 'day')
        expect(recieveDelay).toBe(data.expected.delay)
      }
    },
  )

  it('Should get delay 60 for date now when is in progress', async () => {
    const dataInstructionTime = new InstructionTime()

    dataInstructionTime.startAt = new Date()
    dataInstructionTime.endAt = dayjs(new Date()).add(60, 'day').toDate()
    dataInstructionTime.dossier = { id: 1 } as Dossier
    dataInstructionTime.state = EInstructionTimeState.IN_PROGRESS
    service.repository.find = jest.fn()
      .mockResolvedValueOnce([dataInstructionTime] as InstructionTime[])

    const results = {}
    const mockUpsert = jest.fn()
      .mockImplementation(async (obj: Field): Promise<Field[]> => {
        results[obj.sourceId] = obj
        return [new Field()]
      })

    fieldService.upsert = mockUpsert

    await service.instructionTimeCalculation([dataInstructionTime.dossier.id])

    expect(mockUpsert).toBeCalledTimes(2)

    expect(results[fixFieldInstructionTimeDelay.id]).toMatchObject({
      sourceId: fixFieldInstructionTimeDelay.id,
      dossierId: dataInstructionTime.dossier.id,
      numberValue: 60,
      label: fixFieldInstructionTimeDelay.originalLabel,
      type: fixFieldInstructionTimeDelay.type,
      fieldSource: fixFieldInstructionTimeDelay.source,
    })
    expect(results[fixFieldInstructionTimeStatus.id]).toMatchObject({
      sourceId: fixFieldInstructionTimeStatus.id,
      dossierId: dataInstructionTime.dossier.id,
      stringValue: 'Instruction',
      label: fixFieldInstructionTimeStatus.originalLabel,
      type: fixFieldInstructionTimeStatus.type,
      fieldSource: fixFieldInstructionTimeStatus.source,
    })
  })

  it('Should get out delay for date now when is in progress', async () => {
    const dataInstructionTime = new InstructionTime()

    dataInstructionTime.startAt = new Date()
    dataInstructionTime.endAt = dayjs(new Date()).subtract(1, 'day').toDate()
    dataInstructionTime.dossier = { id: 1 } as Dossier
    dataInstructionTime.state = EInstructionTimeState.IN_PROGRESS
    service.repository.find = jest.fn()
      .mockResolvedValueOnce([dataInstructionTime] as InstructionTime[])

    const results = {}
    const mockUpsert = jest.fn()
      .mockImplementation(async (obj: Field): Promise<Field[]> => {
        results[obj.sourceId] = obj
        return [new Field()]
      })
    fieldService.upsert = mockUpsert
    await service.instructionTimeCalculation([dataInstructionTime.dossier.id])

    expect(mockUpsert).toBeCalledTimes(1)

    expect(results[fixFieldInstructionTimeStatus.id]).toMatchObject({
      sourceId: fixFieldInstructionTimeStatus.id,
      dossierId: dataInstructionTime.dossier.id,
      stringValue: 'Délai expiré',
      label: fixFieldInstructionTimeStatus.originalLabel,
      type: fixFieldInstructionTimeStatus.type,
      fieldSource: fixFieldInstructionTimeStatus.source,
    })
  })

  it('Should get stop delay for date now when is in 2nd demand', async () => {
    const dataInstructionTime = new InstructionTime()

    dataInstructionTime.startAt = new Date()
    dataInstructionTime.stopAt = dayjs(dataInstructionTime.stopAt)
      .add(5, 'day')
      .toDate()
    dataInstructionTime.endAt = dayjs(dataInstructionTime.stopAt)
      .add(20, 'day')
      .toDate()
    dataInstructionTime.dossier = { id: 1 } as Dossier
    dataInstructionTime.state = EInstructionTimeState.SECOND_REQUEST

    service.repository.find = jest.fn()
      .mockResolvedValueOnce([dataInstructionTime] as InstructionTime[])

    const results = {}
    const mockUpsert = jest.fn()
      .mockImplementation(async (obj: Field): Promise<Field[]> => {
        results[obj.sourceId] = obj
        return [new Field()]
      })
    fieldService.upsert = mockUpsert
    const result = await service.instructionTimeCalculation([
      dataInstructionTime.dossier.id,
    ])

    expect(mockUpsert).toBeCalledTimes(2)

    expect(results[fixFieldInstructionTimeDelay.id]).toMatchObject({
      sourceId: fixFieldInstructionTimeDelay.id,
      dossierId: dataInstructionTime.dossier.id,
      numberValue: 20,
      label: fixFieldInstructionTimeDelay.originalLabel,
      type: fixFieldInstructionTimeDelay.type,
      fieldSource: fixFieldInstructionTimeDelay.source,
    })
    expect(results[fixFieldInstructionTimeStatus.id]).toMatchObject({
      sourceId: fixFieldInstructionTimeStatus.id,
      dossierId: dataInstructionTime.dossier.id,
      stringValue: '2ème demande',
      label: fixFieldInstructionTimeStatus.originalLabel,
      type: fixFieldInstructionTimeStatus.type,
      fieldSource: fixFieldInstructionTimeStatus.source,
    })
  })

  it('Should get delay to 20 for date now when is in intent opposition', async () => {
    const dataInstructionTime = new InstructionTime()

    dataInstructionTime.startAt = new Date()
    dataInstructionTime.endAt = dayjs().add(20, 'day').toDate()
    dataInstructionTime.dossier = { id: 1 } as Dossier
    dataInstructionTime.state = EInstructionTimeState.INTENT_OPPO

    const results = {}
    const mockUpsert = jest.fn()
      .mockImplementation(async (obj: Field): Promise<Field[]> => {
        results[obj.sourceId] = obj
        return [new Field()]
      })

    fieldService.upsert = mockUpsert
    service.repository.find = jest.fn()
      .mockResolvedValueOnce([dataInstructionTime] as InstructionTime[])

    await service.instructionTimeCalculation([dataInstructionTime.dossier.id])

    expect(mockUpsert).toBeCalledTimes(2)

    expect(results[fixFieldInstructionTimeDelay.id]).toMatchObject({
      sourceId: fixFieldInstructionTimeDelay.id,
      dossierId: dataInstructionTime.dossier.id,
      numberValue: 20,
      label: fixFieldInstructionTimeDelay.originalLabel,
      type: fixFieldInstructionTimeDelay.type,
      fieldSource: fixFieldInstructionTimeDelay.source,
    })
    expect(results[fixFieldInstructionTimeStatus.id]).toMatchObject({
      sourceId: fixFieldInstructionTimeStatus.id,
      dossierId: dataInstructionTime.dossier.id,
      stringValue: 'Intention opposition',
      label: fixFieldInstructionTimeStatus.originalLabel,
      type: fixFieldInstructionTimeStatus.type,
      fieldSource: fixFieldInstructionTimeStatus.source,
    })
  })

  it('Should get delay to 0 for date now when the date of intent opposition is more 30 days  ', async () => {
    const dataInstructionTime = new InstructionTime()

    dataInstructionTime.startAt = new Date()
    dataInstructionTime.endAt = dayjs().add(-1, 'day').toDate()
    dataInstructionTime.dossier = { id: 1 } as Dossier
    dataInstructionTime.state = EInstructionTimeState.INTENT_OPPO

    service.repository.find = jest.fn()
       .mockResolvedValueOnce([dataInstructionTime] as InstructionTime[])

    const results = {}
    const mockUpsert = jest.fn()
      .mockImplementation(async (obj: Field): Promise<Field[]> => {
        results[obj.sourceId] = obj
        return [new Field()]
      })

    fieldService.upsert = mockUpsert

    await service.instructionTimeCalculation([dataInstructionTime.dossier.id])
    expect(fieldService.upsert).toBeCalledTimes(2)

    expect(results[fixFieldInstructionTimeDelay.id]).toMatchObject({
      sourceId: fixFieldInstructionTimeDelay.id,
      dossierId: dataInstructionTime.dossier.id,
      numberValue: 0,
      label: fixFieldInstructionTimeDelay.originalLabel,
      type: fixFieldInstructionTimeDelay.type,
      fieldSource: fixFieldInstructionTimeDelay.source,
    })
    expect(results[fixFieldInstructionTimeStatus.id]).toMatchObject({
      sourceId: fixFieldInstructionTimeStatus.id,
      dossierId: dataInstructionTime.dossier.id,
      stringValue: 'Intention opposition',
      label: fixFieldInstructionTimeStatus.originalLabel,
      type: fixFieldInstructionTimeStatus.type,
      fieldSource: fixFieldInstructionTimeStatus.source,
    })
  })
})
