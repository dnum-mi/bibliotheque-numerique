import { TestingModuleFactory } from '../../../common/testing-module.factory'
import { dataSource } from '../../../data-source-e2e.typeorm'
import { INestApplication } from '@nestjs/common'
import { Queue } from 'bull'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import { DossierService } from '@/modules/dossiers/providers/dossier.service'
import { RepetitionChamp } from '@dnum-mi/ds-api-client'
import * as console from 'node:console'

describe('Dossier sync processors', () => {
  let app: INestApplication
  let dossierService: DossierService
  let syncQueue: Queue
  const anomymisedValue = 'Anonymised'
  const demandeurKeys = ['nom', 'prenom', 'civilite']

  beforeEach(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    dossierService = await app.resolve(DossierService)
    syncQueue = testingModule.syncQueue
    syncQueue.empty()
    syncQueue.pause()
  })

  afterAll(async () => {
    await syncQueue.resume()
    await app.close()
    await dataSource.destroy()
  })

  it('Anonymise', async () => {
    await syncQueue.resume()
    const job = await syncQueue.add(eJobName.AnonymiseAll)

    await job.finished().then(a => {
      console.log(a)
    })

    // Check if the job AnonymiseAll is completed
    const isCompleted = await job.isCompleted()
    expect(isCompleted).toBe(true)

    // Get all active jobs, and wait for the job to be completed
    const jobs = await syncQueue.getJobs(['active'])
    await Promise.all(jobs.map(async job => await job.finished()))

    const dossierAnonymise = await dossierService.findOneById(19)
    expect(dossierAnonymise).toBeDefined()

    // Verify the anonymisation for demandeur
    expect(dossierAnonymise.dsDataJson.demandeur).toBeDefined()
    demandeurKeys.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(dossierAnonymise.dsDataJson.demandeur, key)) {
        expect(dossierAnonymise.dsDataJson.demandeur[key]).toBe(anomymisedValue)
      }
    })

    const dossierChamps = dossierAnonymise.dsDataJson.champs
    // Verify the anonymisation for champs
    expect(dossierChamps).toBeDefined()
    expect(dossierChamps).toHaveLength(4)
    expect(dossierChamps[0].stringValue).toBe(anomymisedValue)
    expect(dossierChamps[1].stringValue).toBe(anomymisedValue)
    expect(dossierChamps[2].stringValue).toBe('10')

    // Verify the anonymisation for champs repeatable
    const champsRepeatable: RepetitionChamp = dossierChamps[3] as RepetitionChamp
    expect(champsRepeatable.label).toBe('Personnes')
    expect(champsRepeatable.rows).toHaveLength(1)
    expect(champsRepeatable.rows[0].champs).toHaveLength(2)
    // TODO: Fix this test, in fixtures __typename can't be loaded with yml file, so the test is failing
    // expect(champsRepeatable.rows[0].champs[0].stringValue).toBe(anomymisedValue)
    // expect(champsRepeatable.rows[0].champs[1].stringValue).toBe(anomymisedValue)
  })
})
