import { Test, TestingModule } from '@nestjs/testing'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { OrganismeService } from '@/modules/organismes/providers/organisme.service'
import { OrganismeProcessor } from '@/apps/worker-sync/processors/organisme.processor'
import { loggerServiceMock } from '../../../../test/mock/logger-service.mock'
import { ALS_INSTANCE } from '@/shared/modules/als/als.module'
import { BnConfigurationService } from '@/shared/modules/bn-configurations/providers/bn-configuration.service'

const originalDate = global.Date

describe('OrganismeProcessor', () => {
  let processor: OrganismeProcessor
  let updateFct: any
  let getOrganismeFct: any
  let job: {
    progress: any
    finished: any
    log: any
  }

  beforeEach(async () => {
    job = {
      progress: jest.fn(),
      finished: jest.fn(),
      log: jest.fn(),
    }
    getOrganismeFct = jest.fn()
    updateFct = jest.fn().mockImplementation((where, update) => ({
      where,
      update,
      then: (fct) => fct(),
    }))
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [OrganismeProcessor],
    })
      .useMocker((token) => {
        if (token === LoggerService) {
          return loggerServiceMock
        } else if (token === OrganismeService) {
          return {
            getAllOrganismeWithoutYear: getOrganismeFct,
            repository: {
              update: updateFct,
            },
          }
        } else if (token === ALS_INSTANCE) {
          return {
            run: async (obj, fct) => fct(),
          }
        } else if (token === BnConfigurationService) {
          return {
            findByKeyName: jest.fn().mockResolvedValue({ stringValue: '6' }),
          }
        } else {
          return {}
        }
      })
      .compile()

    processor = module.get<OrganismeProcessor>(OrganismeProcessor)
  })

  describe('computeOrganismeDDC', () => {
    it('should be defined', () => {
      expect(processor).toBeDefined()
    })

    it('should do nothing if no organisme found', async () => {
      getOrganismeFct.mockResolvedValue([])
      await processor.computeOrganismeDDC(job as any)
      expect(job.finished).toHaveBeenCalled()
      expect(updateFct).not.toHaveBeenCalled()
    })

    it('should add last year', async () => {
      const date = new Date('2024-01-01')
      jest
        .spyOn(global, 'Date') // @ts-ignore
        .mockImplementation((smth) => (smth ? new originalDate(smth) : date))
      getOrganismeFct.mockResolvedValue([
        {
          id: 1,
          fiscalEndDateAt: new Date('2010-04-01'),
          missingDeclarationYears: [],
        },
      ])
      await processor.computeOrganismeDDC(job as any)
      expect(job.finished).toHaveBeenCalled()
      expect(updateFct).toHaveBeenCalledWith(
        { id: 1 },
        { missingDeclarationYears: [2023] },
      )
    })

    it('should add last year', async () => {
      const date = new Date('2024-04-01')
      jest
        .spyOn(global, 'Date') // @ts-ignore
        .mockImplementation((smth) => (smth ? new originalDate(smth) : date))
      getOrganismeFct.mockResolvedValue([
        {
          id: 1,
          fiscalEndDateAt: new Date('2010-06-01'),
          missingDeclarationYears: [],
        },
      ])
      await processor.computeOrganismeDDC(job as any)
      expect(job.finished).toHaveBeenCalled()
      expect(updateFct).toHaveBeenCalledWith(
        { id: 1 },
        { missingDeclarationYears: [2023] },
      )
    })

    it('should add currentYear year', async () => {
      const date = new Date('2024-12-01')
      jest
        .spyOn(global, 'Date') // @ts-ignore
        .mockImplementation((smth) => (smth ? new originalDate(smth) : date))
      getOrganismeFct.mockResolvedValue([
        {
          id: 1,
          fiscalEndDateAt: new Date('2010-01-01'),
          missingDeclarationYears: [],
        },
      ])
      await processor.computeOrganismeDDC(job as any)
      expect(job.finished).toHaveBeenCalled()
      expect(updateFct).toHaveBeenCalledWith(
        { id: 1 },
        { missingDeclarationYears: [2024] },
      )
    })
  })
})
