import { loggerServiceMock } from "../../../../test/mock/logger-service.mock"
import { UserWithEditableRole } from "../objects/dtos/output"
import { RoleService } from "./role.service"
import { UserService } from "./user.service"

describe("role.service", ()=> {
  let service: RoleService
  let userService: UserService
  beforeEach(()=>{
    userService = jest.createMockFromModule('./user.service')
    // @ts-ignore
    userService.repository = {
      update: jest.fn()
    }
    userService.deleteUserRefreshTokens = jest.fn().mockResolvedValue(undefined);
    service = new RoleService(loggerServiceMock, userService)
  })

  it('update Many roles', async () => {
    const user: UserWithEditableRole = {
      originalUser: {
        id: 1,
        createdAt: new Date("2024-03-18T08:15:48.375Z"),
        updatedAt: new Date("2025-01-24T12:58:57.673Z"),
        email: 'test-1@test.com',
        lastname: 'test-nom',
        firstname: 'test-prenom',
        job: 'testeur',
        prefecture: '75 - Paris',
        role: {
          label: 'instructor',
          options: {
            '1': { national: false, prefectures: [] },
            '6': { national: false, prefectures: [] },
            '7': { national: false, prefectures: [] },
            '8': { national: false, prefectures: [] }
          }
        }
      },
      possibleRoles: [ 'superadmin', 'admin', 'instructor' ],
      deletable: true,
      demarcheHash: {
        '1': {
          id: 1,
          title: 'Demarche 1',
          types: [ 'ASSO', 'FE', 'FDD', 'FRUP' ],
          dsId: 5,
          identification: 'FE',
          dsCreatedAt: new Date('2022-10-11T09:43:49+02:00'),
          dsPublishedAt: new Date('2023-10-06T11:05:05+02:00'),
          checked: true,
          editable: true,
          prefectureOptions: {
            national: { value: false, editable: true },
            prefectures: { value: [], deletable: [], addable: [] }
          }
        },
        '2': {
          id: 2,
          title: 'Demarche 2',
          types: [],
          dsId: 38,
          identification: null,
          dsCreatedAt: new Date('2023-10-02T09:28:22+02:00'),
          dsPublishedAt: new Date('2023-10-02T09:29:28+02:00'),
          checked: false,
          editable: true,
          prefectureOptions: {
            national: { value: false, editable: true },
            prefectures: { value: [], deletable: [], addable: [] }
          }
        },
        '3': {
          id: 3,
          title: 'Demarche 3',
          types: [],
          dsId: 37,
          identification: null,
          dsCreatedAt: new Date('2023-09-25T10:25:37+02:00'),
          dsPublishedAt: new Date('2023-09-25T10:28:20+02:00'),
          checked: false,
          editable: true,
          prefectureOptions: {
            national: { value: false, editable: true },
            prefectures: { value: [], deletable: [], addable: [] }
          }
        },
        '4': {
          id: 4,
          title: 'Demarche 4',
          types: [],
          dsId: 36,
          identification: null,
          dsCreatedAt: new Date('2023-09-24T12:01:26+02:00'),
          dsPublishedAt: new Date('2023-09-24T12:05:23+02:00'),
          checked: false,
          editable: true,
          prefectureOptions: {
            national: { value: false, editable: true },
            prefectures: { value: [], deletable: [], addable: [] }
          }
        },
        '5': {
          id: 5,
          title: 'Demarche 5',
          types: [],
          dsId: 12,
          identification: null,
          dsCreatedAt: new Date('2022-11-15T10:42:07+01:00'),
          dsPublishedAt: new Date('2022-11-16T15:26:56+01:00'),
          checked: false,
          editable: true,
          prefectureOptions: {
            national: { value: false, editable: true },
            prefectures: { value: [], deletable: [], addable: [] }
          }
        },
        '6': {
          id: 6,
          title: 'Demarche 6',
          types: [ 'FDD' ],
          dsId: 7,
          identification: null,
          dsCreatedAt: new Date('2022-10-17T11:32:12+02:00'),
          dsPublishedAt: new Date('2022-10-17T17:17:36+02:00'),
          checked: true,
          editable: true,
          prefectureOptions: {
            national: { value: false, editable: true },
            prefectures: { value: [], deletable: [], addable: [] }
          }
        },
        '7': {
          id: 7,
          title: 'Demarche 7',
          types: [],
          dsId: 52,
          identification: null,
          dsCreatedAt: new Date('2024-02-26T14:07:37+01:00'),
          dsPublishedAt: new Date('2024-02-26T14:09:00+01:00'),
          checked: false,
          editable: true,
          prefectureOptions: {
            national: { value: false, editable: true },
            prefectures: { value: [], deletable: [], addable: [] }
          }
        },
        '8': {
          id: 8,
          title: 'Demarche 8',
          types: [],
          dsId: 57,
          identification: null,
          dsCreatedAt: new Date('2024-03-11T11:37:34+01:00'),
          dsPublishedAt: new Date('2024-03-11T11:45:04+01:00'),
          checked: false,
          editable: true,
          prefectureOptions: {
            national: { value: false, editable: true },
            prefectures: { value: [], deletable: [], addable: [] }
          }
        },
        '9': {
          id: 9,
          title: 'Demarche 9',
          types: [],
          dsId: 55,
          identification: null,
          dsCreatedAt: new Date('2024-03-11T11:35:11+01:00'),
          dsPublishedAt: new Date('2024-03-11T11:35:44+01:00'),
          checked: false,
          editable: true,
          prefectureOptions: {
            national: { value: false, editable: true },
            prefectures: { value: [], deletable: [], addable: [] }
          }
        },
        '10': {
          id: 10,
          title: 'Demarche 10',
          types: [],
          dsId: 59,
          identification: null,
          dsCreatedAt: new Date('2024-03-25T11:51:31+01:00'),
          dsPublishedAt: new Date('2024-03-25T11:53:16+01:00'),
          checked: false,
          editable: true,
          prefectureOptions: {
            national: { value: false, editable: true },
            prefectures: { value: [], deletable: [], addable: [] }
          }
        },
      }
    }
    const dtos = [
      { demarcheId: 2, checked: true },
      { demarcheId: 3, checked: true },
      { demarcheId: 4, checked: true },
      { demarcheId: 5, checked: true },
    ]

    jest.spyOn(userService.repository, 'update').mockImplementation(
      // @ts-ignore
      async (criteria, partialEntity) => {
        expect(criteria).toEqual({
          id: 1
        })
        // @ts-ignore
      expect(partialEntity.role.options).toEqual({
        '1': { national: false, prefectures: []},
        '2': { national: false, prefectures: []},
        '3': { national: false, prefectures: []},
        '4': { national: false, prefectures: []},
        '5': { national: false, prefectures: []},
        '6': { national: false, prefectures: []},
        '7': { national: false, prefectures: []},
        '8': { national: false, prefectures: []},
      })

    })
    await service.patchOneRoles(user, dtos)
  })
})
