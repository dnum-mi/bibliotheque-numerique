import { loggerServiceMock } from "../../../../test/mock/logger-service.mock"
import { SyncStateGenericService } from "./sync-state-generic.service"
import { BaseEntitySyncState } from '../objects/entities/base-entity-sync-state.entity'
import { SyncState } from '../objects/entities/sync-state.entity'
import { Repository } from 'typeorm'
import { fakerFR as faker } from '@faker-js/faker'
import { states } from "@biblio-num/shared"

class MockEntity extends BaseEntitySyncState {
  test: string
}

class MockSyncStateService extends SyncStateGenericService<MockEntity> {

}

describe('Generic Sync State Service', () => {
  let service: MockSyncStateService
  let repo: Repository<SyncState>
  let repoParent: Repository<MockEntity>
  let newSyncState: Partial<SyncState>
  beforeAll(() => {
    repo = jest.createMockFromModule('typeorm/repository/Repository')
    repoParent = jest.createMockFromModule('typeorm/repository/Repository')
    repoParent.findOne = jest.fn()
    newSyncState = {
      id: faker.number.int(),
      state: 'queued',
      lastSynchronisedAt: new Date("2022-01-01T00:00:00Z"),
      message: null,
    }

    repo.create = jest.fn().mockImplementation(() => ({
      ...newSyncState,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
    repo.save = jest.fn().mockImplementation((syncState) =>  {
      syncState.updatedAt = new Date()
      return syncState
    })

    repoParent.save = jest.fn().mockImplementation((obj) =>  {
      obj.updatedAt = new Date()
      return obj
    })

    service = new MockSyncStateService(
      loggerServiceMock,
      repo,
      repoParent,
    )
  })

  // setStateQueued- create a new sync state with state 'queued' if entity parent not found
  it('should create a new sync state with state "queued" if it does not exist', async () => {
    repoParent.findOne = jest.fn().mockResolvedValue(null)
    const syncState = await service.setStateQueued({ test: 'id_test' }, 'message_test')

    expect(syncState).toMatchObject({...newSyncState, state: 'queued', message: 'message_test'})
  })

  // setStateQueued- create a new sync state with state 'queued' if entity.syncStat not exist
  it('should create a new sync state with state "queued" if syncState is not in entity', async () => {
    const mockEntity = new MockEntity()
    repoParent.findOne = jest.fn().mockResolvedValue(mockEntity)
    const syncState = await service.setStateQueued({ test: 'id_test' }, 'message_test')
    expect(syncState).toMatchObject({...newSyncState, state: 'queued', message: 'message_test'})
    expect(mockEntity.syncState).toEqual(syncState)
  })


  // setStateQueued- update sync state with state 'queued' if entity.syncStat not exist
  it('should update sync state with state "queued" if entiyt.syncState existe', async () => {
    const mockEntity = new MockEntity()
    const oldSyncState = {
      id: faker.number.int(),
      lastSynchronisedAt: faker.date.past(),
      message: faker.lorem.sentence(),
      state: faker.helpers.arrayElement(states),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
    }
    mockEntity.syncState = { ...oldSyncState } as SyncState
    repoParent.findOne = jest.fn().mockResolvedValue(mockEntity)
    const syncState = await service.setStateQueued({ test: 'id_test' }, 'message_test')
    expect(syncState).toMatchObject({...oldSyncState, state: 'queued', message: 'message_test', updatedAt: expect.any(Date)})
    expect(syncState.updatedAt.toDateString()).toBe((new Date()).toDateString())
    expect(mockEntity.syncState).toEqual(syncState)
  })


  it('should create a new sync state with state "uploading" if it does not exist', async () => {
    repoParent.findOne = jest.fn().mockResolvedValue(null)
    const syncState = await service.setStateUploading({where: { test: 'id_test' }, notFoundMessage: 'message_test'})

    expect(syncState).toMatchObject({...newSyncState, state: 'uploading', message: null })
  })

  it('should update sync state with state "uploading" if syncState exist alone', async () => {
    repoParent.findOne = jest.fn().mockResolvedValue(null)
    const oldSyncState = {
      id: faker.number.int(),
      lastSynchronisedAt: faker.date.past(),
      message: faker.lorem.sentence(),
      state: faker.helpers.arrayElement(states),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
    }
    repo.findOne = jest.fn().mockResolvedValue({ ...oldSyncState })
    const syncState = await service.setStateUploading({where: { test: 'id_test' }, notFoundMessage: 'message_test', id: 2})

    expect(syncState).toMatchObject({...oldSyncState, state: 'uploading', message: null, updatedAt: expect.any(Date)})
  })

  it('should update sync state with state "uploading" if syncState exist in mockEntity', async () => {
    const mockEntity = new MockEntity()
    repoParent.findOne = jest.fn().mockResolvedValue(mockEntity)
    const oldSyncState = {
      id: faker.number.int(),
      lastSynchronisedAt: faker.date.past(),
      message: faker.lorem.sentence(),
      state: faker.helpers.arrayElement(states),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
    }
    mockEntity.syncState = { ...oldSyncState } as SyncState
    repo.findOne = jest.fn().mockResolvedValue({ ...oldSyncState })
    const syncState = await service.setStateUploading({where: { test: 'id_test' }, notFoundMessage: 'message_test', id: 2})

    expect(syncState).toMatchObject({...oldSyncState, state: 'uploading', message: null, updatedAt: expect.any(Date)})
    expect(syncState.updatedAt.toDateString()).toBe((new Date()).toDateString())
    expect(mockEntity.syncState).toEqual(syncState)
  })


  it('should create a new sync state with state "uploaded" if it does not exist', async () => {
    repoParent.findOne = jest.fn().mockResolvedValue(null)
    const syncState = await service.setStateUploaded({where: { test: 'id_test' }, notFoundMessage: 'message_test'})

    expect(syncState).toMatchObject({...newSyncState, state: 'uploaded', message: null, lastSynchronisedAt: expect.any(Date)})
    expect(syncState.lastSynchronisedAt.toDateString()).toBe((new Date()).toDateString())
  })

  it('should update sync state with state "uploaded" if syncState exist alone', async () => {
    repoParent.findOne = jest.fn().mockResolvedValue(null)
    const oldSyncState = {
      id: faker.number.int(),
      lastSynchronisedAt: faker.date.past(),
      message: faker.lorem.sentence(),
      state: faker.helpers.arrayElement(states),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
    }
    repo.findOne = jest.fn().mockResolvedValue({ ...oldSyncState })
    const syncState = await service.setStateUploaded({where: { test: 'id_test' }, notFoundMessage: 'message_test', id: 2})

    expect(syncState).toMatchObject({...oldSyncState, state: 'uploaded', message: null, updatedAt: expect.any(Date), lastSynchronisedAt: expect.any(Date)})
    expect(syncState.lastSynchronisedAt.toDateString()).toBe((new Date()).toDateString())
  })

  it('should update sync state with state "uploaded" if syncState exist in mockEntity', async () => {
    const mockEntity = new MockEntity()
    repoParent.findOne = jest.fn().mockResolvedValue(mockEntity)
    const oldSyncState = {
      id: faker.number.int(),
      lastSynchronisedAt: faker.date.past(),
      message: faker.lorem.sentence(),
      state: faker.helpers.arrayElement(states),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
    }
    mockEntity.syncState = { ...oldSyncState } as SyncState
    repo.findOne = jest.fn().mockResolvedValue({ ...oldSyncState })
    const syncState = await service.setStateUploaded({where: { test: 'id_test' }, notFoundMessage: 'message_test', id: 2})

    expect(syncState).toMatchObject({...oldSyncState, state: 'uploaded', message: null, updatedAt: expect.any(Date), lastSynchronisedAt: expect.any(Date)})
    expect(syncState.updatedAt.toDateString()).toBe((new Date()).toDateString())
    expect(syncState.lastSynchronisedAt.toDateString()).toBe((new Date()).toDateString())
    expect(mockEntity.syncState).toEqual(syncState)
  })


  it('should create a new sync state with state "failed" if it does not exist', async () => {
    repoParent.findOne = jest.fn().mockResolvedValue(null)
    const syncState = await service.setStateFailed('test message d Error', {where: { test: 'id_test' }, notFoundMessage: 'message_test'})

    expect(syncState).toMatchObject({...newSyncState, state: 'failed', message: 'test message d Error'})

  })

  it('should update sync state with state "failed" if syncState exist alone', async () => {
    repoParent.findOne = jest.fn().mockResolvedValue(null)
    const oldSyncState = {
      id: faker.number.int(),
      lastSynchronisedAt: faker.date.past(),
      message: faker.lorem.sentence(),
      state: faker.helpers.arrayElement(states),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
    }
    repo.findOne = jest.fn().mockResolvedValue({ ...oldSyncState })
    const syncState = await service.setStateFailed('test message d Error', {where: { test: 'id_test' }, notFoundMessage: 'message_test', id: 2})
    expect(syncState).toMatchObject({...oldSyncState, state: 'failed', message: 'test message d Error', updatedAt: expect.any(Date)})

  })

  it('should update sync state with state "failed" if syncState exist in mockEntity', async () => {
    const mockEntity = new MockEntity()
    repoParent.findOne = jest.fn().mockResolvedValue(mockEntity)
    const oldSyncState = {
      id: faker.number.int(),
      lastSynchronisedAt: faker.date.past(),
      message: faker.lorem.sentence(),
      state: faker.helpers.arrayElement(states),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
    }
    mockEntity.syncState = { ...oldSyncState } as SyncState
    repo.findOne = jest.fn().mockResolvedValue({ ...oldSyncState })
    const syncState = await service.setStateFailed('test message d Error', {where: { test: 'id_test' }, notFoundMessage: 'message_test', id: 2})

    expect(syncState).toMatchObject({...oldSyncState, state: 'failed', message: 'test message d Error', updatedAt: expect.any(Date)})
    expect(syncState.updatedAt.toDateString()).toBe((new Date()).toDateString())
    expect(mockEntity.syncState).toEqual(syncState)
  })

})
