import { TestingModuleFactory } from '../../../common/testing-module.factory'
import { dataSource } from '../../../data-source-e2e.typeorm'
import { INestApplication } from '@nestjs/common'
import { Queue } from 'bull'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import { DossierService } from '@/modules/dossiers/providers/dossier.service'
import { FieldService } from '@/modules/dossiers/providers/field.service'
import { RepetitionChamp } from '@dnum-mi/ds-api-client'
import * as console from 'node:console'

describe('Dossier sync processors', () => {
  let app: INestApplication
  let dossierService: DossierService
  let fieldService: FieldService
  let syncQueue: Queue
  const anomymisedValue = 'Anonymised'
  const demandeurKeys = ['nom', 'prenom', 'civilite']

  beforeEach(async () => {
    const testingModule = new TestingModuleFactory()
    await testingModule.init()
    app = testingModule.app
    dossierService = await app.resolve(DossierService)
    fieldService = await app.resolve(FieldService)
    syncQueue = testingModule.syncQueue
    syncQueue.on('error', (err) => {
      console.log(`ERROR: ${err.stack}`)
    })
    syncQueue.on('failed', (job, err) => {
      console.log(`FAILED: ${job.name}`)
      console.log(`FAILED: ${err.stack}`)
    })

    await syncQueue.empty()
    await syncQueue.pause()
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
    const jobs = await syncQueue.getJobs(['active', 'completed'])

    await Promise.all(jobs.map(async job => {
      if (!job?.finishedOn) {
        await job?.finished()
      }
    }))

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
    expect(champsRepeatable.rows).toHaveLength(2)
    expect(champsRepeatable.rows[0].champs).toHaveLength(3)
    // TODO: Fix this test, in fixtures __typename can't be loaded with yml file, so the test is failing
    expect(champsRepeatable.rows[0].champs[0].stringValue).toBe(anomymisedValue)
    expect(champsRepeatable.rows[0].champs[1].stringValue).toBe(anomymisedValue)
    expect(champsRepeatable.rows[0].champs[2].stringValue).toBe('10')

    expect(champsRepeatable.rows[1].champs[0].stringValue).toBe(anomymisedValue)
    expect(champsRepeatable.rows[1].champs[1].stringValue).toBe(anomymisedValue)
    expect(champsRepeatable.rows[1].champs[2].stringValue).toBe('11')

    const fieldsAnonymise = await fieldService.findWithFilter({ dossierId: 19 })

    expect(fieldsAnonymise).toEqual(expect.arrayContaining([
      expect.objectContaining({
        label: 'Nom',
        stringValue: anomymisedValue,
        anonymisedAt: expect.any(Date),
        parentId: null,
        rawJson: null,
        parentRowIndex: null,
      }),
    ]))
    expect(fieldsAnonymise).toEqual(expect.arrayContaining([
      expect.objectContaining({
        label: 'Prénom',
        stringValue: anomymisedValue,
        anonymisedAt: expect.any(Date),
        rawJson: null,
        parentId: null,
        parentRowIndex: null,
      }),
    ]))
    expect(fieldsAnonymise).toEqual(expect.arrayContaining([
      expect.objectContaining({
        label: 'Age',
        stringValue: '10',
        anonymisedAt: null,
        rawJson: expect.objectContaining({
          label: 'Age',
          stringValue: '10',
        }),
        parentId: null,
        parentRowIndex: null,
      }),
    ]))

    const field = fieldsAnonymise.find(fa => fa.dsChampType === 'RepetitionChamp')
    expect(field).toBeDefined()
    // TODO: Fix to do for the anonymization field of type RepetitionChamp
    // expect(field.anonymisedAt).toBe(expect.any(Date))
    // expect(field.rawJson).toBeNull()

    expect(fieldsAnonymise).toEqual(expect.arrayContaining([
      expect.objectContaining({
        label: 'Nom',
        stringValue: anomymisedValue,
        anonymisedAt: expect.any(Date),
        rawJson: null,
        parentId: field.id,
        parentRowIndex: 0,
      }),
    ]))

    expect(fieldsAnonymise).toEqual(expect.arrayContaining([
      expect.objectContaining({
        label: 'Prénom',
        stringValue: anomymisedValue,
        anonymisedAt: expect.any(Date),
        rawJson: null,
        parentId: field.id,
        parentRowIndex: 0,
      }),
    ]))
    expect(fieldsAnonymise).toEqual(expect.arrayContaining([
      expect.objectContaining({
        label: 'Age',
        stringValue: '10',
        anonymisedAt: null,
        rawJson: expect.objectContaining({
          label: 'Age',
          stringValue: '10',
        }),
        parentId: field.id,
        parentRowIndex: 0,
      }),
    ]))

    expect(fieldsAnonymise).toEqual(expect.arrayContaining([
      expect.objectContaining({
        label: 'Nom',
        stringValue: anomymisedValue,
        anonymisedAt: expect.any(Date),
        rawJson: null,
        parentId: field.id,
        parentRowIndex: 1,
      }),
      expect.objectContaining({
        label: 'Prénom',
        stringValue: anomymisedValue,
        anonymisedAt: expect.any(Date),
        rawJson: null,
        parentId: field.id,
        parentRowIndex: 1,
      }),
      expect.objectContaining({
        label: 'Age',
        stringValue: '11',
        anonymisedAt: null,
        rawJson: expect.objectContaining({
          label: 'Age',
          stringValue: '11',
        }),
        parentId: field.id,
        parentRowIndex: 1,
      }),

    ]))
  }, 20000)
})
