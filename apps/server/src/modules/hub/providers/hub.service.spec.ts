import { fakerFR as faker } from '@faker-js/faker'

import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { HubService } from "./hub.service";
import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { Dossier } from "../../dossiers/objects/entities/dossier.entity";
import { Demarche } from "../../demarches/objects/entities/demarche.entity";
import { PdfExportService } from "../../../shared/modules/pdf-export/pdf-export.service";
import { DossierService } from "../../dossiers/providers/dossier.service";
import { Axios } from 'axios';
import { dossierSourceArray } from '@biblio-num/shared';
import { DossierState } from '@dnum-mi/ds-api-client';


describe('HubService', () => {

  const loggerMock = jest.createMockFromModule<LoggerService>(
        '@/shared/modules/logger/logger.service',
  )
  loggerMock.setContext = jest.fn()

  const configService = jest.createMockFromModule<ConfigService>(
    '@nestjs/config',
  )
  configService.get = jest.fn()

  const repoDossier = jest.createMockFromModule<Repository<Dossier>>(
    'typeorm/repository/Repository',
  )
  const repoDemarche = jest.createMockFromModule<Repository<Demarche>>(
    'typeorm/repository/Repository',
  )
  const pdfExportService = jest.createMockFromModule<PdfExportService>(
    '@/shared/modules/pdf-export/pdf-export.service',
  )
  const dossierService = jest.createMockFromModule<DossierService>(
    '@/modules/dossiers/providers/dossier.service',
  )

  const axiosMock = jest.createMockFromModule<Axios>('axios')
  axiosMock.get = jest.fn()

  let hubService: HubService
  beforeAll(() => {
    hubService = new HubService(
      loggerMock,
      configService,
      repoDossier,
      repoDemarche,
      pdfExportService,
      dossierService,
    )
  })

  it('should be defined', () => {
    expect(hubService).toBeDefined()
  });

  it('should get 5 dossiers from foundation', async () => {
    let idDossier= 1
    let dossierNumber = 1
    let demarcheNumber = 1

    const dateDepot1 = faker.date.past()
    const dateDepot2 = faker.date.past({ refDate: dateDepot1 })
    const dateDepot3 = faker.date.past({ refDate: dateDepot2 })
    const dateDepot4 = faker.date.past({ refDate: dateDepot3 })

    const organismeDossier4 = {
      id: null,
      dossierNumber: dossierNumber++,
      source: dossierSourceArray[0],
      demarche: `Test Demarche ${demarcheNumber++}`,
      statut: DossierState.Accepte,
      repere: null,
      isCorrection: false,
      dateDepot: dateDepot1,
      dateDecision: faker.date.past(),
      datePublication: faker.date.past(),
    }

  const organismeDossier1 = {
      id: idDossier++,
      dossierNumber: dossierNumber++,
      source: dossierSourceArray[0],
      demarche: `Test Demarche ${demarcheNumber++}`,
      statut: DossierState.Accepte,
      repere: null,
      isCorrection: false,
      dateDepot: dateDepot4,
      dateDecision: faker.date.past({ refDate: organismeDossier4.dateDepot }),
      datePublication: faker.date.past(),
    }

    const organismeDossier2 = {
      id: idDossier++,
      dossierNumber: dossierNumber++,
      source: dossierSourceArray[0],
      demarche: `Test Demarche ${demarcheNumber++}`,
      statut: DossierState.Accepte,
      repere: null,
      isCorrection: false,
      dateDepot: dateDepot2,
      dateDecision: faker.date.past({ refDate: organismeDossier1.dateDecision }),
      datePublication: faker.date.past(),
    }

    const organismeDossier3 = {
      id: idDossier++,
      dossierNumber: dossierNumber++,
      source: dossierSourceArray[0],
      demarche: `Test Demarche ${demarcheNumber++}`,
      statut: DossierState.Refuse,
      repere: null,
      isCorrection: false,
      dateDepot: dateDepot3,
      dateDecision: faker.date.between({ from: dateDepot3, to: dateDepot1 }),
      datePublication: faker.date.past(),
    }

    const entries = [
      organismeDossier4,
      {
        ...organismeDossier1,
        isCorrection: true,
      },
      organismeDossier2,
      {
        ...organismeDossier1,
        statut:DossierState.EnInstruction,
        dateDecision: faker.date.past({ refDate: organismeDossier2.dateDecision}),
        datePublication: null,
      },
    ]
    jest.spyOn(hubService as any, '_fetchAndMapEvents').mockResolvedValue(entries)

    jest.spyOn(hubService as any, '_fetchAndMapDsDossiers').mockResolvedValue([
       organismeDossier1,
       organismeDossier3,
       organismeDossier2,
    ])

    const result = await hubService.getFoundationDossiers('refFoundation')

    expect(result).toBeDefined()


    const expected = [...entries.map(d => {
      d.statut = d.statut === DossierState.EnInstruction ? DossierState.Accepte : d.statut
      return d
    }), organismeDossier3 ].sort((a, b) => b.dateDepot.getTime() - a.dateDepot.getTime())

    expect(result).toHaveLength(expected.length)
    expect(result).toEqual(expected)
  })

  it('should get 1 dossier from foundation with filter', async () => {
    const organismeDossier1 = {
      id: 1,
      dossierNumber: 1,
      source: dossierSourceArray[0],
      demarche: `Test Demarche 1`,
      statut: DossierState.Accepte,
      repere: null,
      isCorrection: false,
      dateDepot: faker.date.past(),
      dateDecision: faker.date.past(),
      datePublication: faker.date.past(),
    }

    jest.spyOn(hubService as any, '_fetchAndMapEvents').mockResolvedValue([{
      ...organismeDossier1,
      statut: DossierState.EnInstruction,
      dateDecision: faker.date.past(),
    }])

    jest.spyOn(hubService as any, '_fetchAndMapDsDossiers').mockResolvedValue([{
      ...organismeDossier1,
      datePublication: null,
    }])

    const result = await hubService.getFoundationDossiers('refFoundation')

    expect(result).toBeDefined()
    expect(result).toHaveLength(1)
    expect(result).toEqual([organismeDossier1])

  })

    it('should get 1 dossier accepte with not found foundation in BN', async () => {
    const organismeDossier1 = {
      id: 1,
      dossierNumber: 1,
      source: dossierSourceArray[0],
      demarche: `Test Demarche 1`,
      statut: DossierState.Accepte,
      repere: null,
      isCorrection: false,
      dateDepot: faker.date.past(),
      dateDecision: faker.date.past(),
      datePublication: faker.date.past(),
    }

    jest.spyOn(hubService as any, '_fetchAndMapEvents').mockResolvedValue([{
      ...organismeDossier1,
      statut: DossierState.EnInstruction,
    }])

    jest.spyOn(hubService as any, '_fetchAndMapDsDossiers').mockResolvedValue([])

    const result = await hubService.getFoundationDossiers('refFoundation')

    expect(result).toBeDefined()
    expect(result).toHaveLength(1)
    expect(result).toEqual([organismeDossier1])

  })

})
