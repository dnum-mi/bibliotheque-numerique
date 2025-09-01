import { INestApplication } from '@nestjs/common'
import { Queue } from 'bull'

import { TestingModuleFactory, Tokens } from '../common/testing-module.factory'
import { HubService } from '../../../src/modules/hub/providers/hub.service'
import { RnfService } from '../../../src/modules/organismes/providers/rnf.service'
import { RnaService } from '../../../src/modules/organismes/providers/rna.service'

import { dataSource } from '../data-source-e2e.typeorm'
import { eBnConfiguration, IOrganismeOutput } from '@biblio-num/shared'
import * as request from 'supertest'
import { BnConfigurationOutputDto } from '../../../src/shared/modules/bn-configurations/objects/dto/bn-configuration-output.dto'
import { foundationHub } from '../../mock/mock-hub/data/foundation.data.mock'
import { eJobName } from '../../../src/shared/modules/custom-bull/objects/const/job-name.enum'
import { deleteJobs, waitJobsFinished } from '../common/jobs-utils'
import { SyncState } from '../../../src/shared/sync-state/objects/entities/sync-state.entity'
import { Organisme } from '../../../src/modules/organismes/objects/organisme.entity'
import { addLuhnToRnf } from '../../../src/shared/utils/rnf.utils'
import { associationHub } from '../../mock/mock-hub/data/association.data.mock'
import { fabulousAssociationDataMock } from '../../mock/rna-service/data/fabulous-association.data.mock'

const idRna = 'W123456789'
const urlAssociation = `/organismes/rna/${idRna}`

describe('get foundation to sync with hub', () => {
  let app: INestApplication
  let syncQueue: Queue
  let tokens: Tokens
  let hubService: HubService
  let rnfService: RnfService
  let rnaService: RnaService
  let syncRnfViaHub:BnConfigurationOutputDto
  let syncRnaViaHub:BnConfigurationOutputDto
  let searchHub: BnConfigurationOutputDto

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    hubService = app.get(HubService)
    rnfService = app.get(RnfService)
    rnaService = app.get(RnaService)
    syncQueue = testingModule.syncQueue
    tokens = testingModule.tokens

    syncQueue.on('error', (err) => {
      console.log(`ERROR: ${err.stack}`)
    })
    syncQueue.on('failed', (job, err) => {
      console.log(`FAILED: ${job.name}`)
      console.log(`FAILED: ${err.stack}`)
    })

    await syncQueue.empty()
    await syncQueue.pause()

    syncRnfViaHub = await request(app.getHttpServer())
      .get(`/bn-configurations/${eBnConfiguration.SYNC_RNF_VIA_HUB}`)
      .set('Authorization', `Bearer ${tokens.sudo}`)
      .expect(200)
      .then(response => response.body)

    syncRnaViaHub = await request(app.getHttpServer())
      .get(`/bn-configurations/${eBnConfiguration.SYNC_RNA_VIA_HUB}`)
      .set('Authorization', `Bearer ${tokens.sudo}`)
      .expect(200)
      .then(response => response.body)

    searchHub = await request(app.getHttpServer())
      .get(`/bn-configurations/${eBnConfiguration.ENABLE_HUB_SEARCH}`)
      .set('Authorization', `Bearer ${tokens.sudo}`)
      .expect(200)
      .then((response) => response.body)
  })

  afterAll(async () => {
    await request(app.getHttpServer())
      .patch(`/bn-configurations/${syncRnfViaHub.id}`)
      .set('Authorization', `Bearer ${tokens.sudo}`)
      .send({ keyName: eBnConfiguration.SYNC_RNF_VIA_HUB, stringValue: syncRnfViaHub.stringValue, valueType: 'boolean' })
      .expect(200)

    await request(app.getHttpServer())
      .patch(`/bn-configurations/${searchHub.id}`)
      .set('Authorization', `Bearer ${tokens.sudo}`)
      .send({ keyName: eBnConfiguration.ENABLE_HUB_SEARCH, stringValue: searchHub.stringValue, valueType: 'boolean' })
      .expect(200)

    await request(app.getHttpServer())
      .patch(`/bn-configurations/${syncRnaViaHub.id}`)
      .set('Authorization', `Bearer ${tokens.sudo}`)
      .send({ keyName: eBnConfiguration.SYNC_RNA_VIA_HUB, stringValue: syncRnaViaHub.stringValue, valueType: 'boolean' })
      .expect(200)

    // TODO: Impact on redis dev which is on pause
    await syncQueue.resume()
    await app.close()
    await dataSource.destroy()
  })

  describe('get foundation to sync with hub', () => {
    beforeEach(async () => {
      jest.clearAllMocks()

      const foundation = await dataSource.getRepository(Organisme).findOne({ where: { type: 'unknown' } })
      if (foundation?.syncState) await dataSource.getRepository(SyncState).delete({ id: foundation.syncState.id })
      if (foundation) await dataSource.getRepository(Organisme).delete({ type: 'unknown' })

      // update flags Synchro Hub of RNF
      await request(app.getHttpServer())
        .patch(`/bn-configurations/${syncRnfViaHub.id}`)
        .set('Authorization', `Bearer ${tokens.sudo}`)
        .send({ keyName: eBnConfiguration.SYNC_RNF_VIA_HUB, stringValue: 'true', valueType: 'boolean' })
        .expect(200)

      await request(app.getHttpServer())
        .patch(`/bn-configurations/${searchHub.id}`)
        .set('Authorization', `Bearer ${tokens.sudo}`)
        .send({ keyName: eBnConfiguration.ENABLE_HUB_SEARCH, stringValue: 'true', valueType: 'boolean' })
        .expect(200)

      await syncQueue.resume()
      await deleteJobs(syncQueue, [eJobName.SyncOneRnfOrganisme])
    })

    it('should 404 get fondation from hub if SEARCH_SYNC_HUB is false', async () => {
      const idRnf = addLuhnToRnf('495-FRUP-01051')
      await request(app.getHttpServer())
        .patch(`/bn-configurations/${searchHub.id}`)
        .set('Authorization', `Bearer ${tokens.sudo}`)
        .send({ keyName: eBnConfiguration.ENABLE_HUB_SEARCH, stringValue: 'false', valueType: 'boolean' })
        .expect(200)

      jest.spyOn(hubService, 'getFoundation').mockResolvedValue(null)
      jest.spyOn(rnfService, 'getFoundation').mockResolvedValue(null)

      await request(app.getHttpServer())
        .post(`/organismes/rnf/${idRnf}`)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(201)

      await waitJobsFinished(syncQueue, [eJobName.SyncOneRnfOrganisme])

      await request(app.getHttpServer())
        .get(`/organismes/rnf/${idRnf}`)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(404)

      expect(hubService.getFoundation).not.toHaveBeenCalled()
      expect(rnfService.getFoundation).not.toHaveBeenCalled()
    })

    it('should 404 get fondation no existe in hub if SEARCH_SYNC_HUB is true', async () => {
      const idRnf = addLuhnToRnf('495-FRUP-01052')

      jest.spyOn(hubService, 'getFoundation').mockResolvedValue(null)
      jest.spyOn(rnfService, 'getFoundation').mockResolvedValue(null)

      await request(app.getHttpServer())
        .post(`/organismes/rnf/${idRnf}`)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(201)

      await waitJobsFinished(syncQueue, [eJobName.SyncOneRnfOrganisme])

      await request(app.getHttpServer())
        .get(`/organismes/rnf/${idRnf}`)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(404)

      expect(hubService.getFoundation).toHaveBeenCalledTimes(1)
      expect(rnfService.getFoundation).not.toHaveBeenCalled()
    })

    it('should get fondation empty if it existe in hub if SEARCH_SYNC_HUB is true', async () => {
      const idRnf = addLuhnToRnf('495-FRUP-01053')

      const fondationFromHub = { ...foundationHub, id: idRnf }

      jest.spyOn(hubService, 'getFoundation').mockResolvedValue(fondationFromHub)
      jest.spyOn(rnfService, 'getFoundation').mockResolvedValue(null)

      await syncQueue.pause()
      await request(app.getHttpServer())
        .post(`/organismes/rnf/${idRnf}`)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(201)

      const organimseCreated = await request(app.getHttpServer())
        .get(`/organismes/rnf/${idRnf}`)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(200)
        .then((response) => response.body)

    expect(organimseCreated).toMatchObject({
      bn: {
        id: expect.any(Number),
        addressCityName: null,
        addressPostalCode: null,
        addressStreetName: null,
        addressStreetNumber: null,
        addressDepartmentCode: null,
        addressDepartmentName: null,
        addressLabel: null,
        addressRegionCode: null,
        addressRegionName: null,
        addressStreetAddress: null,
        addressType: null,
        dateCreation: null,
        dateDissolution: null,
        declarationYears: [],
        email: null,
        missingDeclarationYears: [],
        persons: [],
        phoneNumber: null,
        rnaJson: null,
        rnfJson: null,
        siege: {
          isVerified: false,
          prefecture: '',
        },
        title: null,
        idRna: null,
        type: 'unknown',
        idRnf,
        state: 'queued',
        syncState: {
          id: expect.any(Number),
          state: 'queued',
          message: '',
          lastSynchronisedAt: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },

        } as IOrganismeOutput['bn'],
        siaf: null,
        type: 'rnf',
      } as IOrganismeOutput)

      await syncQueue.resume()

      await waitJobsFinished(syncQueue, [eJobName.SyncOneRnfOrganisme])

      const jobs = await syncQueue.getCompleted()
      expect(jobs.map(job => job.name)).toEqual(expect.arrayContaining([eJobName.SyncOneRnfOrganisme]))

      expect(hubService.getFoundation).toHaveBeenCalled()
      expect(rnfService.getFoundation).not.toHaveBeenCalled()

      const organimseFound = await request(app.getHttpServer())
        .get(`/organismes/rnf/${idRnf}`)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(200)
        .then((response) => response.body)

    expect(organimseFound).toMatchObject({
      type: 'rnf',
      siaf: null,
      dossiersCount: 0,
      syncState: null,
      bn: {
        id: expect.any(Number),
        title: foundationHub.title,
        type: 'FRUP',
        idRnf,
        syncState: {
          id: expect.any(Number),
          state: 'uploaded',
          message: null,
          lastSynchronisedAt: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      } as IOrganismeOutput['bn'],
    } as IOrganismeOutput)

      // clean
      await dataSource.getRepository(SyncState).delete({ id: organimseFound.bn.syncState.id })
      await dataSource.getRepository(Organisme).delete({ id: organimseFound.bn.id })
    })

    it('should 404 get fondation no existe in hub if SEARCH_SYNC_HUB is true AND SYNC_RNF_VIA_HUB is false', async () => {
      const idRnf = addLuhnToRnf('495-FRUP-01054')
      await request(app.getHttpServer())
        .patch(`/bn-configurations/${syncRnfViaHub.id}`)
        .set('Authorization', `Bearer ${tokens.sudo}`)
        .send({ keyName: eBnConfiguration.SYNC_RNF_VIA_HUB, stringValue: 'false', valueType: 'boolean' })
        .expect(200)

      jest.spyOn(hubService, 'getFoundation').mockResolvedValue(null)
      jest.spyOn(rnfService, 'getFoundation').mockResolvedValue(null)

      await request(app.getHttpServer())
        .post(`/organismes/rnf/${idRnf}`)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(201)

      await waitJobsFinished(syncQueue, [eJobName.SyncOneRnfOrganisme])

      const resp = await request(app.getHttpServer())
        .get(`/organismes/rnf/${idRnf}`)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(404)

      expect(resp.status).toBe(404)
      expect(hubService.getFoundation).not.toHaveBeenCalled()
      expect(rnfService.getFoundation).toHaveBeenCalledTimes(1)
    })

    it('should get fondation empty if it existe in hub if SEARCH_SYNC_HUB is true AND SYNC_RNF_VIA_HUB is false', async () => {
      const idRnf = addLuhnToRnf('495-FRUP-01055')

      await request(app.getHttpServer())
        .patch(`/bn-configurations/${syncRnfViaHub.id}`)
        .set('Authorization', `Bearer ${tokens.sudo}`)
        .send({ keyName: eBnConfiguration.SYNC_RNF_VIA_HUB, stringValue: 'false', valueType: 'boolean' })
        .expect(200)

      const fondationFromHub = { ...foundationHub, id: '495-FRUP-01051-02' }

      jest.spyOn(hubService, 'getFoundation').mockResolvedValue(null)
      jest.spyOn(rnfService, 'getFoundation').mockResolvedValue(fondationFromHub)

      await syncQueue.pause()

      await request(app.getHttpServer())
        .post(`/organismes/rnf/${idRnf}`)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(201)

      const organimseCreated = await request(app.getHttpServer())
        .get(`/organismes/rnf/${idRnf}`)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(200)
        .then((response) => response.body)

    expect(organimseCreated).toMatchObject({
      bn: {
        id: expect.any(Number),
        addressCityName: null,
        addressPostalCode: null,
        addressStreetName: null,
        addressStreetNumber: null,
        addressDepartmentCode: null,
        addressDepartmentName: null,
        addressLabel: null,
        addressRegionCode: null,
        addressRegionName: null,
        addressStreetAddress: null,
        addressType: null,
        dateCreation: null,
        dateDissolution: null,
        declarationYears: [],
        email: null,
        missingDeclarationYears: [],
        persons: [],
        phoneNumber: null,
        rnaJson: null,
        rnfJson: null,
        siege: {
          isVerified: false,
          prefecture: '',
        },
        title: null,
        idRna: null,
        type: 'unknown',
        idRnf,
        state: 'queued',
        syncState: {
          id: expect.any(Number),
          state: 'queued',
          message: '',
          lastSynchronisedAt: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      } as IOrganismeOutput['bn'],
      siaf: null,
      type: 'rnf',
    } as IOrganismeOutput)

      await syncQueue.resume()

      await waitJobsFinished(syncQueue, [eJobName.SyncOneRnfOrganisme])

      const jobs = await syncQueue.getCompleted()
      expect(jobs.map(job => job.name)).toEqual(expect.arrayContaining([eJobName.SyncOneRnfOrganisme]))

      expect(hubService.getFoundation).not.toHaveBeenCalled()
      expect(rnfService.getFoundation).toHaveBeenCalled()

      const organimseFound = await request(app.getHttpServer())
        .get(`/organismes/rnf/${idRnf}`)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(200)
        .then((response) => response.body)

    expect(organimseFound).toMatchObject({
      type: 'rnf',
      siaf: null,
      dossiersCount: 0,
      syncState: null,
      bn: {
        id: expect.any(Number),
        title: foundationHub.title,
        type: 'FRUP',
        idRnf,
        syncState: {
          id: expect.any(Number),
          state: 'uploaded',
          message: null,
          lastSynchronisedAt: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      } as IOrganismeOutput['bn'],
    } as IOrganismeOutput)

      // clean
      await dataSource.getRepository(SyncState).delete({ id: organimseFound.bn.syncState.id })
      await dataSource.getRepository(Organisme).delete({ id: organimseFound.bn.id })
    })
  })

  describe('get association to sync with hub', () => {
    beforeEach(async () => {
      jest.clearAllMocks()

      const association = await dataSource.getRepository(Organisme).findOne({ where: { type: 'unknown' } })
      if (association?.syncState) await dataSource.getRepository(SyncState).delete({ id: association.syncState.id })
      if (association) await dataSource.getRepository(Organisme).delete({ type: 'unknown' })

      // update flags Synchro Hub of RNF
      await request(app.getHttpServer())
        .patch(`/bn-configurations/${syncRnaViaHub.id}`)
        .set('Authorization', `Bearer ${tokens.sudo}`)
        .send({ keyName: eBnConfiguration.SYNC_RNA_VIA_HUB, stringValue: 'true', valueType: 'boolean' })
        .expect(200)

      await request(app.getHttpServer())
        .patch(`/bn-configurations/${searchHub.id}`)
        .set('Authorization', `Bearer ${tokens.sudo}`)
        .send({ keyName: eBnConfiguration.ENABLE_HUB_SEARCH, stringValue: 'true', valueType: 'boolean' })
        .expect(200)

      await syncQueue.resume()
      await deleteJobs(syncQueue, [eJobName.SyncOneRnaOrganisme])
    })
    afterEach(async () => {
      const association = await dataSource.getRepository(Organisme).findOne({ where: { idRna } })
      if (association?.syncState) await dataSource.getRepository(SyncState).delete({ id: association.syncState.id })
      if (association) await dataSource.getRepository(Organisme).delete({ idRna })
    })
    it('should 404 get association from hub if SEARCH_SYNC_HUB is false', async () => {
      await request(app.getHttpServer())
        .patch(`/bn-configurations/${searchHub.id}`)
        .set('Authorization', `Bearer ${tokens.sudo}`)
        .send({ keyName: eBnConfiguration.ENABLE_HUB_SEARCH, stringValue: 'false', valueType: 'boolean' })
        .expect(200)

      jest.spyOn(hubService, 'getAssociation').mockResolvedValue(null)
      jest.spyOn(rnaService, 'getAssociation').mockResolvedValue(null)

      await request(app.getHttpServer())
        .post(urlAssociation)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(201)

      await waitJobsFinished(syncQueue, [eJobName.SyncOneRnaOrganisme])

      await request(app.getHttpServer())
        .get(urlAssociation)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(404)

      expect(hubService.getAssociation).not.toHaveBeenCalled()
      expect(rnaService.getAssociation).not.toHaveBeenCalled()
    })

    it('should 404 get association no existe in hub if SEARCH_SYNC_HUB is true', async () => {
      jest.spyOn(hubService, 'getAssociation').mockResolvedValue(null)
      jest.spyOn(rnaService, 'getAssociation').mockResolvedValue(null)

      await request(app.getHttpServer())
        .post(urlAssociation)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(201)

      await waitJobsFinished(syncQueue, [eJobName.SyncOneRnfOrganisme])

      await request(app.getHttpServer())
        .get(urlAssociation)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(404)

      expect(hubService.getAssociation).toHaveBeenCalledTimes(1)
      expect(rnaService.getAssociation).not.toHaveBeenCalled()
    })

    it('should get association empty if it existe in hub if SEARCH_SYNC_HUB is true', async () => {
      const associationFromHub = { ...associationHub, id: idRna }

      jest.spyOn(hubService, 'getAssociation').mockResolvedValue(associationFromHub)
      jest.spyOn(rnaService, 'getAssociation').mockResolvedValue(null)

      await syncQueue.pause()
      await request(app.getHttpServer())
        .post(urlAssociation)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(201)

      const organimseCreated = await request(app.getHttpServer())
        .get(urlAssociation)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(200)
        .then((response) => response.body)

      expect(organimseCreated).toMatchObject({
        bn: {
          id: expect.any(Number),
          addressCityName: null,
          addressPostalCode: null,
          addressStreetName: null,
          addressStreetNumber: null,
          addressDepartmentCode: null,
          addressDepartmentName: null,
          addressLabel: null,
          addressRegionCode: null,
          addressRegionName: null,
          addressStreetAddress: null,
          addressType: null,
          dateCreation: null,
          dateDissolution: null,
          declarationYears: [],
          email: null,
          missingDeclarationYears: [],
          persons: [],
          phoneNumber: null,
          rnaJson: null,
          rnfJson: null,
          title: null,
          idRnf: null,
          type: 'unknown',
          idRna: idRna,
          state: 'queued',
          syncState: {
            id: expect.any(Number),
            state: 'queued',
            message: '',
            lastSynchronisedAt: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },

        } as IOrganismeOutput['bn'],
        siaf: null,
        type: 'rna',
      } as IOrganismeOutput)

      await syncQueue.resume()

      await waitJobsFinished(syncQueue, [eJobName.SyncOneRnaOrganisme])

      const jobs = await syncQueue.getCompleted()
      expect(jobs.map(job => job.name)).toEqual(expect.arrayContaining([eJobName.SyncOneRnaOrganisme]))

      expect(hubService.getAssociation).toHaveBeenCalled()
      expect(rnaService.getAssociation).not.toHaveBeenCalled()

      const organimseFound = await request(app.getHttpServer())
        .get(urlAssociation)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(200)
        .then((response) => response.body)

      expect(organimseFound).toMatchObject({
        type: 'rna',
        siaf: null,
        dossiersCount: 0,
        syncState: {
          id: expect.any(Number),
          state: 'uploaded',
          message: null,
          lastSynchronisedAt: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
        bn: {
          id: expect.any(Number),
          title: associationFromHub.title,
          type: 'ASSO',
          idRna: idRna,
          syncState: {
            id: expect.any(Number),
            state: 'uploaded',
            message: null,
            lastSynchronisedAt: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        } as IOrganismeOutput['bn'],
      } as IOrganismeOutput)

      // clean
      await dataSource.getRepository(SyncState).delete({ id: organimseFound.bn.syncState.id })
      await dataSource.getRepository(Organisme).delete({ id: organimseFound.bn.id })
    })

    it('should 404 get association no existe in hub if SEARCH_SYNC_HUB is true AND SYNC_RNF_VIA_HUB is false', async () => {
      await request(app.getHttpServer())
        .patch(`/bn-configurations/${syncRnaViaHub.id}`)
        .set('Authorization', `Bearer ${tokens.sudo}`)
        .send({ keyName: eBnConfiguration.SYNC_RNA_VIA_HUB, stringValue: 'false', valueType: 'boolean' })
        .expect(200)

      jest.spyOn(hubService, 'getAssociation').mockResolvedValue(null)
      jest.spyOn(rnaService, 'getAssociation').mockResolvedValue(null)

      await request(app.getHttpServer())
        .post(urlAssociation)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(201)

      await waitJobsFinished(syncQueue, [eJobName.SyncOneRnaOrganisme])

      const resp = await request(app.getHttpServer())
        .get(urlAssociation)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(404)

      expect(resp.status).toBe(404)
      expect(hubService.getAssociation).not.toHaveBeenCalled()
      expect(rnaService.getAssociation).toHaveBeenCalledTimes(1)
    })

    it('should get association empty if it existe in hub if SEARCH_SYNC_HUB is true AND SYNC_RNF_VIA_HUB is false', async () => {
      await request(app.getHttpServer())
        .patch(`/bn-configurations/${syncRnaViaHub.id}`)
        .set('Authorization', `Bearer ${tokens.sudo}`)
        .send({ keyName: eBnConfiguration.SYNC_RNA_VIA_HUB, stringValue: 'false', valueType: 'boolean' })
        .expect(200)

      const associationFromApi = { ...fabulousAssociationDataMock, rna: idRna }

      jest.spyOn(hubService, 'getAssociation').mockResolvedValue(null)
      jest.spyOn(rnaService, 'getAssociation').mockResolvedValue(associationFromApi)

      await syncQueue.pause()

      await request(app.getHttpServer())
        .post(urlAssociation)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(201)

      const organimseCreated = await request(app.getHttpServer())
        .get(urlAssociation)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(200)
        .then((response) => response.body)

      expect(organimseCreated).toMatchObject({
        bn: {
          id: expect.any(Number),
          addressCityName: null,
          addressPostalCode: null,
          addressStreetName: null,
          addressStreetNumber: null,
          addressDepartmentCode: null,
          addressDepartmentName: null,
          addressLabel: null,
          addressRegionCode: null,
          addressRegionName: null,
          addressStreetAddress: null,
          addressType: null,
          dateCreation: null,
          dateDissolution: null,
          declarationYears: [],
          email: null,
          missingDeclarationYears: [],
          persons: [],
          phoneNumber: null,
          rnaJson: null,
          rnfJson: null,
          title: null,
          idRnf: null,
          type: 'unknown',
          idRna: idRna,
          state: 'queued',
          syncState: {
            id: expect.any(Number),
            state: 'queued',
            message: '',
            lastSynchronisedAt: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        } as IOrganismeOutput['bn'],
        siaf: null,
        type: 'rna',
      } as IOrganismeOutput)

      await syncQueue.resume()

      await waitJobsFinished(syncQueue, [eJobName.SyncOneRnaOrganisme])

      const jobs = await syncQueue.getCompleted()
      expect(jobs.map(job => job.name)).toEqual(expect.arrayContaining([eJobName.SyncOneRnaOrganisme]))

      expect(hubService.getAssociation).not.toHaveBeenCalled()
      expect(rnaService.getAssociation).toHaveBeenCalled()

      const organimseFound = await request(app.getHttpServer())
        .get(urlAssociation)
        .set('Authorization', `Bearer ${tokens.instructor}`)
        .expect(200)
        .then((response) => response.body)

      expect(organimseFound).toMatchObject({
        type: 'rna',
        siaf: null,
        dossiersCount: 0,
        syncState: {
          id: expect.any(Number),
          state: 'uploaded',
          message: null,
          lastSynchronisedAt: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
        bn: {
          id: expect.any(Number),
          title: associationFromApi.nom,
          type: 'ASSO',
          idRna: idRna,
          syncState: {
            id: expect.any(Number),
            state: 'uploaded',
            message: null,
            lastSynchronisedAt: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        } as IOrganismeOutput['bn'],
      } as IOrganismeOutput)

      // clean
      await dataSource.getRepository(SyncState).delete({ id: organimseFound.bn.syncState.id })
      await dataSource.getRepository(Organisme).delete({ id: organimseFound.bn.id })
    })
  })
})
