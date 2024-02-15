import { Test, TestingModule } from '@nestjs/testing'
import { RoleGuard } from './role.guard'
import { Reflector } from '@nestjs/core'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { ExecutionContext } from '@nestjs/common'
import { PUBLIC_ROUTE_KEY } from '@/modules/users/providers/decorators/public-route.decorator'
import { Roles } from '@biblio-num/shared-utils'
import { ConfigService } from '@nestjs/config'
import { ROLE_KEY } from '@/modules/users/providers/decorators/role.decorator'

describe('RoleGuard', () => {
  let guard: RoleGuard
  let reflector: Reflector
  let logger: LoggerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleGuard, Reflector, LoggerService],
    }).useMocker(token => {
      if (token === ConfigService) {
        return { get: jest.fn() }
      }
    }).compile()

    guard = module.get<RoleGuard>(RoleGuard)
    reflector = module.get<Reflector>(Reflector)
    logger = module.get<LoggerService>(LoggerService)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })

  describe('canActivate', () => {
    let context: ExecutionContext
    let getRequest: jest.Mock

    beforeEach(() => {
      getRequest = jest.fn()
      context = {
        switchToHttp: () => ({ getRequest }),
        getClass: jest.fn(),
        getHandler: jest.fn(),
      } as unknown as ExecutionContext
    })

    it('Should allow access for public routes', () => {
      jest.spyOn(reflector, 'get').mockImplementation((key) => key === PUBLIC_ROUTE_KEY)
      expect(guard.canActivate(context)).toBe(true)
    })

    it('Should throw an error if no role is defined for a route', () => {
      jest.spyOn(reflector, 'get').mockReturnValueOnce(undefined)
      expect(() => guard.canActivate(context)).toThrowError()
    })

    it('Should throw an UnauthorizedException if user is not connected', () => {
      jest.spyOn(reflector, 'get').mockImplementation((key) => key === PUBLIC_ROUTE_KEY ? false : 'admin')
      getRequest.mockReturnValueOnce({})
      expect(() => guard.canActivate(context)).toThrow('You are not connected.')
    })

    it('should allow access if user has no role and route is any', () => {
      jest.spyOn(reflector, 'get').mockReturnValueOnce('any')
      getRequest.mockReturnValueOnce({
        user: {
          role: { label: null },
          email: 'norole@example.com',
        },
      })
      expect(guard.canActivate(context)).toBe(true)
    })

    it('should allow access if user role is equal to required role', () => {
      jest.spyOn(reflector, 'get').mockReturnValueOnce(Roles.admin)
      getRequest.mockReturnValueOnce({
        user: {
          role: { label: Roles.admin },
          email: 'admin@example.com',
        },
      })
      expect(guard.canActivate(context)).toBe(true)
    })

    it('should allow access if user role is superior to required role', () => {
      jest.spyOn(reflector, 'get').mockReturnValueOnce('any')
      getRequest.mockReturnValueOnce({
        user: {
          role: { label: Roles.instructor },
          email: 'admin@example.com',
        },
      })
      expect(guard.canActivate(context)).toBe(true)
      jest.spyOn(reflector, 'get').mockReturnValueOnce(Roles.instructor)
      getRequest.mockReturnValueOnce({
        user: {
          role: { label: Roles.admin },
          email: 'admin@example.com',
        },
      })
      expect(guard.canActivate(context)).toBe(true)
      jest.spyOn(reflector, 'get').mockReturnValueOnce(Roles.admin)
      getRequest.mockReturnValueOnce({
        user: {
          role: { label: Roles.superadmin },
          email: 'admin@example.com',
        },
      })
      expect(guard.canActivate(context)).toBe(true)
      jest.spyOn(reflector, 'get').mockReturnValueOnce(Roles.superadmin)
      getRequest.mockReturnValueOnce({
        user: {
          role: { label: Roles.sudo },
          email: 'admin@example.com',
        },
      })
      expect(guard.canActivate(context)).toBe(true)
    })

    it('should log a warning and deny access if user role is inferior to required role', () => {
      const spyLoggerWarn = jest.spyOn(logger, 'warn')

      jest.spyOn(reflector, 'get').mockImplementation(key => key === ROLE_KEY ? Roles.admin : false)
      getRequest.mockReturnValueOnce({
        user: {
          role: { label: Roles.instructor },
          email: 'user@example.com',
        },
      })

      expect(guard.canActivate(context)).toBeFalsy()
      expect(spyLoggerWarn).toHaveBeenCalledWith(
        expect.stringContaining(
          'cannot access to route which has a minimum role of admin.',
        ),
      )
    })
  })
})
