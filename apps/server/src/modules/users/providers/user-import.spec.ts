import { Test, TestingModule } from '@nestjs/testing'
import { UserImportService } from './user-import.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { DemarcheService } from '@/modules/demarches/providers/services/demarche.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from '@/modules/users/objects/user.entity'
import { BadRequestException } from '@nestjs/common'
import { ExcelUser } from '@/modules/users/objects/types/excel-user.type'
import { loggerServiceMock } from '../../../../test/mock/logger-service.mock'
import { Repository } from 'typeorm'
import { RefreshToken } from '@/modules/auth/objects/refresh-token.entity'

describe('UserImportService', () => {
  let service: UserImportService
  let demarcheService: jest.Mocked<DemarcheService>
  let userRepo: jest.Mocked<Repository<User>>
  let mockQueryRunner: any

  beforeEach(async () => {
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserImportService,
        {
          provide: LoggerService,
          useValue: loggerServiceMock,
        },
        {
          provide: DemarcheService,
          useValue: {
            findMultipleDemarche: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            manager: {
              connection: {
                createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
              },
            },
            create: jest.fn(),
            exist: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get(UserImportService)
    demarcheService = module.get(DemarcheService)
    userRepo = module.get(getRepositoryToken(User))
  })

  describe('formatRole()', () => {
    const validDemarcheIds = {
      '42': 1,
      '43': 2,
      '44': 3,
    }

    it('should throw if role is unknown', () => {
      expect(() =>
        service['formatRole']('invalidRole', '42', '75', validDemarcheIds),
      ).toThrow("this role invalidRole doesn't exist")
    })

    it('should throw if department does not exist', () => {
      expect(() =>
        service['formatRole']('admin', '42', '999', validDemarcheIds),
      ).toThrow('Department key D999 does not exist')
    })

    it('should throw if one of multiple departments is invalid', () => {
      expect(() =>
        service['formatRole']('admin', '42', '75;999', validDemarcheIds),
      ).toThrow('Department key D999 does not exist')
    })

    it('should throw if demarche id does not exist', () => {
      expect(() =>
        service['formatRole']('admin', '42;999', '75', validDemarcheIds),
      ).toThrow('Demarche with id 999 does not exist.')
    })

    it('should return correct role for superadmin', () => {
      const role = service['formatRole']('superadmin', '', '', validDemarcheIds)
      expect(role).toEqual({ label: 'superadmin', options: {} })
    })

    it('should return correct role for admin with one department', () => {
      const role = service['formatRole']('admin', '42', '75', validDemarcheIds)
      expect(role.label).toBe('admin')
      expect(role.options['1'].prefectures).toEqual(['D75'])
    })

    it('should return correct role for admin with multiple departments', () => {
      const role = service['formatRole'](
        'admin',
        '42;43',
        '75;13',
        validDemarcheIds,
      )
      expect(role.options['1'].prefectures).toEqual(['D75', 'D13'])
      expect(role.options['2'].prefectures).toEqual(['D75', 'D13'])
    })

    it('should return correct role for admin with national flag', () => {
      const role = service['formatRole'](
        'admin',
        '42',
        'national',
        validDemarcheIds,
      )
      expect(role.options['1'].national).toBe(true)
      const role2 = service['formatRole']('admin', '42', '4', validDemarcheIds)
      expect(role2.options['1'].prefectures).toEqual(['D04'])
      const role3 = service['formatRole'](
        'admin',
        '42',
        '4; 5;0;12',
        validDemarcheIds,
      )
      expect(role3.options['1'].prefectures).toEqual([
        'D04',
        'D05',
        'D00',
        'D12',
      ])
    })
  })

  describe('formatUser()', () => {
    it('should throw if prefecture does not exist', () => {
      const fakeUser = {
        Préfecture: '999',
      } as ExcelUser

      expect(() => service['formatUser'](fakeUser, {})).toThrow(
        `Prefecture key D999 does not exist`,
      )
    })

    it('should format a valid Excel user', () => {
      const user: ExcelUser = {
        Email: 'jane.doe@mail.com',
        Nom: 'Doe',
        Prénom: 'Jane',
        Poste: 'Chargée de mission',
        Préfecture: '75',
        Role: 'admin',
        'Liste des démarches': '42',
        'Liste des départements': '75',
      }

      const result = service['formatUser'](user, { '42': 1 })
      expect(result.email).toBe('jane.doe@mail.com')
      expect(result.lastname).toBe('Doe')
      expect(result.firstname).toBe('Jane')
      expect(result.password).toBe('user-imported-from-excel')
      //@ts-ignore
      expect(result.role.label).toBe('admin')
    })
  })

  describe('createUserFromExcelData()', () => {
    it('should rollback and throw BadRequestException on any error', async () => {
      const users: ExcelUser[] = [
        {
          Email: 'test@mail.com',
          Nom: 'Doe',
          Prénom: 'John',
          Poste: 'Test',
          Préfecture: '999',
          Role: 'admin',
          'Liste des démarches': '1',
          'Liste des départements': '75',
        },
      ]

      demarcheService.findMultipleDemarche.mockResolvedValue([
        //@ts-ignore
        { id: 1, dsDataJson: { number: 42 } },
      ])

      await expect(service.createUserFromExcelData(users)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should import users correctly and commit the transaction', async () => {
      const user: ExcelUser = {
        Email: 'jane.doe@mail.com',
        Nom: 'Doe',
        Prénom: 'Jane',
        Poste: 'Chargée de mission',
        Préfecture: '75',
        Role: 'admin',
        'Liste des démarches': '42',
        'Liste des départements': '75',
      }

      demarcheService.findMultipleDemarche.mockResolvedValue([
        //@ts-ignore
        { id: 1, dsDataJson: { number: '42' } },
      ])

      //@ts-ignore
      userRepo.create.mockImplementation((dto) => ({ ...dto }))
      const result = await service.createUserFromExcelData([user])

      expect(mockQueryRunner.connect).toHaveBeenCalled()
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled()
      expect(mockQueryRunner.manager.save).toHaveBeenCalledWith({
        email: 'jane.doe@mail.com',
        firstname: 'Jane',
        job: 'Chargée de mission',
        lastname: 'Doe',
        password: 'user-imported-from-excel',
        prefecture: '75 - Paris',
        role: {
          label: 'admin',
          options: {
            1: {
              national: false,
              prefectures: ['D75'],
            },
          },
        },
        skipHashPassword: true,
        validated: false,
      })
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled()
      expect(mockQueryRunner.release).toHaveBeenCalled()

      expect(result).toBe(true)
    })

    it('should only modify role of existing user', async () => {
      const user: ExcelUser = {
        Email: 'jane.doe@mail.com',
        Nom: 'Doe',
        Prénom: 'Jane',
        Poste: 'Chargée de mission',
        Préfecture: '75',
        Role: 'admin',
        'Liste des démarches': '42',
        'Liste des départements': '75',
      }
      demarcheService.findMultipleDemarche.mockResolvedValue([
        //@ts-ignore
        { id: 1, dsDataJson: { number: '42' } },
      ])
      userRepo.findOne.mockResolvedValue({
        id: 42,
        role: { label: 'instructor' },
      } as User)

      const result = await service.createUserFromExcelData([user])

      expect(mockQueryRunner.connect).toHaveBeenCalled()
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled()
      expect(mockQueryRunner.manager.update).toHaveBeenCalledWith(
        User,
        { email: user.Email },
        {
          role: {
            label: 'admin',
            options: {
              1: {
                national: false,
                prefectures: ['D75'],
              },
            },
          },
        },
      )
      expect(mockQueryRunner.manager.delete).toHaveBeenCalledWith(
        RefreshToken,
        { user: 42 },
      )
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled()
      expect(mockQueryRunner.release).toHaveBeenCalled()

      expect(result).toBe(true)
    })
  })
})
