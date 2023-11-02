import { DemarcheService } from '../services/demarche.service'
import { CallHandler, ExecutionContext } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { CurrentDemarcheInterceptor } from './current-demarche.interceptor'
import { Demarche } from '../../objects/entities/demarche.entity'
import { of } from 'rxjs'

describe('CurrentDemarcheInterceptor', () => {
  let interceptor: CurrentDemarcheInterceptor
  let demarcheService: DemarcheService
  let executionContext: ExecutionContext
  let getRequest: jest.Mock
  const next = { handle: jest.fn(() => of('koul')) } as unknown as CallHandler

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrentDemarcheInterceptor,
        {
          provide: DemarcheService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
      ],
    }).compile()

    interceptor = module.get<CurrentDemarcheInterceptor>(
      CurrentDemarcheInterceptor,
    )
    demarcheService = module.get<DemarcheService>(DemarcheService)
    executionContext = {
      switchToHttp: () => ({ getRequest }),
    } as unknown as ExecutionContext
  })

  it('Should throw a NotFoundException if demarcheId is not provided', () => {
    getRequest = jest.fn().mockReturnValue({
      params: {},
    })
    expect(
      () => interceptor.intercept(
        executionContext,
        next,
      ),
    ).toThrowError('No demarche with this id.')
  })

  it('Should throw a NotFoundException if demarcheId does not exist', () => {
    getRequest = jest.fn().mockReturnValue({
      params: {
        demarcheId: 42,
      },
    })
    jest.spyOn(demarcheService, 'findOneById').mockResolvedValue(null)
    expect(
      interceptor.intercept(
        executionContext,
        next,
      ).toPromise(),
    ).rejects.toThrowError('No demarche with this id.')
  })

  it('Should give demarche for superadmin', () => {
    getRequest = jest.fn().mockReturnValue({
      params: {
        demarcheId: 42,
      },
      user: {
        role: {
          label: 'superadmin',
        },
      },
    })
    jest.spyOn(demarcheService, 'findOneById').mockResolvedValue({ id: 42 } as unknown as Demarche)
    expect(
      interceptor.intercept(
        executionContext,
        next,
      ).toPromise(),
    ).resolves.toEqual('koul')
  })

  it('Should give demarche for sudo', () => {
    getRequest = jest.fn().mockReturnValue({
      params: {
        demarcheId: 42,
      },
      user: {
        role: {
          label: 'sudo',
        },
      },
    })
    jest.spyOn(demarcheService, 'findOneById').mockResolvedValue({ id: 42 } as unknown as Demarche)
    expect(
      interceptor.intercept(
        executionContext,
        next,
      ).toPromise(),
    ).resolves.toEqual('koul')
  })

  it('Should give demarche for admin with option', () => {
    getRequest = jest.fn().mockReturnValue({
      params: {
        demarcheId: 42,
      },
      user: {
        role: {
          label: 'admin',
          options: {
            42: true,
          },
        },
      },
    })
    jest.spyOn(demarcheService, 'findOneById').mockResolvedValue({ id: 42 } as unknown as Demarche)
    expect(
      interceptor.intercept(
        executionContext,
        next,
      ).toPromise(),
    ).resolves.toEqual('koul')
  })

  it('Should give demarche for instructor with option', () => {
    getRequest = jest.fn().mockReturnValue({
      params: {
        demarcheId: 42,
      },
      user: {
        role: {
          label: 'admin',
          options: {
            42: true,
          },
        },
      },
    })
    jest.spyOn(demarcheService, 'findOneById').mockResolvedValue({ id: 42 } as unknown as Demarche)
    expect(
      interceptor.intercept(
        executionContext,
        next,
      ).toPromise(),
    ).resolves.toEqual('koul')
  })

  it('Should throw for admin without option', () => {
    getRequest = jest.fn().mockReturnValue({
      params: {
        demarcheId: 42,
      },
      user: {
        role: {
          label: 'admin',
          options: {
            43: true,
          },
        },
      },
    })
    jest.spyOn(demarcheService, 'findOneById').mockResolvedValue({ id: 42 } as unknown as Demarche)
    expect(
      interceptor.intercept(
        executionContext,
        next,
      ).toPromise(),
    ).rejects.toThrowError('You are not allowed to access this demarche.')
  })

  it('Should throw for instructor without option', () => {
    getRequest = jest.fn().mockReturnValue({
      params: {
        demarcheId: 42,
      },
      user: {
        role: {
          label: 'instructor',
          options: {
            43: true,
          },
        },
      },
    })
    jest.spyOn(demarcheService, 'findOneById').mockResolvedValue({ id: 42 } as unknown as Demarche)
    expect(
      interceptor.intercept(
        executionContext,
        next,
      ).toPromise(),
    ).rejects.toThrowError('You are not allowed to access this demarche.')
  })
})
