import { Tokens, TestingModuleFactory } from '../../../common/testing-module.factory'
import { dataSource } from '../../../data-source-e2e.typeorm'
import { INestApplication } from '@nestjs/common'
import { Queue } from 'bull'
import * as request from 'supertest'
import { faker } from '@faker-js/faker/locale/fr'

import { eJobName } from '../../../../../src/shared/modules/custom-bull/objects/const/job-name.enum'
import { eBnConfiguration, eState } from '@biblio-num/shared'
import { waitJobsFinished } from '../../../common/jobs-utils'

import { Organisme } from '../../../../../src/modules/organismes/objects/organisme.entity'

import { HubService } from '../../../../../src/modules/hub/providers/hub.service'
import { RnfService } from '../../../../../src/modules/organismes/providers/rnf.service'

import { foundationHub } from '../../../../mock/mock-hub/data/foundation.data.mock'
import { BnConfigurationOutputDto } from '../../../../../src/shared/modules/bn-configurations/objects/dto/bn-configuration-output.dto'

describe('Synchro foundation hub', () => {
  let app: INestApplication
  let syncQueue: Queue
  let tokens: Tokens
  let hubService: HubService
  let rnfService: RnfService

  beforeAll(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    hubService = app.get(HubService)
    rnfService = app.get(RnfService)
    syncQueue = testingModule.syncQueue
    tokens = testingModule.tokens

    syncQueue.on('error', (err) => {
      console.log(`ERROR: ${err.stack}`)
    })
    syncQueue.on('failed', (job, err) => {
      console.log(`FAILED: ${job.name}`)
      console.log(`FAILED: ${err.stack}`)
    })

    syncQueue.empty()
    syncQueue.pause()
  })

  afterAll(async () => {
    // TODO: Impact on redis dev which is on pause
    await syncQueue.resume()
    await app.close()
    await dataSource.destroy()
  })

  it('Should synchronize with hub when the flag ', async () => {
    await dataSource.manager.insert(Organisme, {
      state: 'uploaded',
      type: 'FE',
      title: foundationHub.title,
      idRnf: foundationHub.id,
    })

    await syncQueue.resume()
    // Re-initialization jobs
    await syncQueue.getJobs(['active', 'completed']).then(async jobs => {
      await Promise.all(jobs.map(async job => job.remove()))
    })

    await syncQueue.removeRepeatableByKey(`${eJobName.SyncAllRnfOrganisme}:.*`)

    // update flags Synchro Hub of RNF
    const SyncRnfViaHub:BnConfigurationOutputDto = await request(app.getHttpServer())
      .get(`/bn-configurations/${eBnConfiguration.SYNC_RNF_VIA_HUB}`)
      .set('Authorization', `Bearer ${tokens.sudo}`)
      .expect(200)
      .then(response => response.body)

    await request(app.getHttpServer())
      .patch(`/bn-configurations/${SyncRnfViaHub.id}`)
      .set('Authorization', `Bearer ${tokens.sudo}`)
      .send({ keyName: eBnConfiguration.SYNC_RNF_VIA_HUB, stringValue: 'true', valueType: 'boolean' })
      .expect(200)

    // Re-initialization the last date of synchronization of Rnf
    const lastFondationSyncAt:BnConfigurationOutputDto = await request(app.getHttpServer())
      .get(`/bn-configurations/${eBnConfiguration.LAST_FOUNDATION_SYNC_AT}`)
      .set('Authorization', `Bearer ${tokens.sudo}`)
      .expect(200)
      .then(response => response.body)

    expect(lastFondationSyncAt.stringValue).toContain('1970-01-01')

    // Stop if there are one error
    syncQueue.on('error', (err) => {
      console.log(`ERROR: ${err.stack}`)
      expect(err).toBeUndefined()
    })
    syncQueue.on('failed', (job, err) => {
      console.log(`FAILED: ${job.name}`)
      console.log(`FAILED: ${err.stack}`)
      expect(err).toBeUndefined()
    })

    // Mock method
    jest.spyOn(hubService, 'getLastImportedFoundations').mockResolvedValueOnce({
      fondations: [{
        id: foundationHub.id,
        updatedAt: '2023-09-25T15:51:11.391Z',
        hubImportedAt: '2024-09-25T15:51:11.391Z',
      }],
      scroll_id: faker.string.nanoid().toString(),
      total_records: 1,
    })

    jest.spyOn(hubService, 'getFoundation').mockResolvedValue(
      foundationHub,
    )

    // Run Job Synchro
    await syncQueue.add(eJobName.SyncAllRnfOrganisme)
    await waitJobsFinished(syncQueue, [eJobName.SyncAllRnfOrganisme, eJobName.SyncOneRnfOrganisme])

    // Expect for synchro of all rnf
    expect(hubService.getLastImportedFoundations).toHaveBeenCalled()
    expect(rnfService.getUpdatedFoundations).not.toHaveBeenCalled()

    const LastFoundationSyncAt1 = await request(app.getHttpServer())
      .get(`/bn-configurations/${eBnConfiguration.LAST_FOUNDATION_SYNC_AT}`)
      .set('Authorization', `Bearer ${tokens.sudo}`)
      .expect(200)
      .then(response => response.body)

    const expectedNow = (new Date()).toISOString().split('-')[0]
    expect(LastFoundationSyncAt1.stringValue).toContain(expectedNow)

    // Wait 2nd times to see eJobName.SyncOneRnfOrganisme
    await waitJobsFinished(syncQueue, [eJobName.SyncAllRnfOrganisme, eJobName.SyncOneRnfOrganisme])
    // Expect for synchro of one rnf
    const jobs = await syncQueue.getCompleted()
    expect(jobs.map(job => job.name)).toEqual(expect.arrayContaining([eJobName.SyncOneRnfOrganisme]))
    expect(hubService.getFoundation).toHaveBeenCalled()
    expect(rnfService.getFoundation).not.toHaveBeenCalled()

    const organismeFound = await dataSource.manager.findOne(Organisme, {
      where: {
        idRnf: foundationHub.id,
      },
    })

    expect(organismeFound.state).toBe(eState.uploaded)
    expect(organismeFound.type).toBe(foundationHub.foundationType)
    expect(organismeFound.title).toBe(foundationHub.title)
    expect(organismeFound.syncState).toMatchObject({
      state: 'uploaded',
      message: null,
    })
    expect(organismeFound.syncState.lastSynchronisedAt.toDateString()).toBe(new Date().toDateString())

    // reset database
    await dataSource.manager.remove(organismeFound.syncState)
    await dataSource.manager.remove(organismeFound)
  })
})
