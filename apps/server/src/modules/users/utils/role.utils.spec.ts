import {
  Roles,
  IRole,
  Prefecture,
  eOrganismeType, IUser,
} from '@biblio-num/shared'
import {
  generateRoleAttributionList,
  generateUserWithEditableRole,
  isEditionAllowed, threeRoles,
} from '@/modules/users/utils/role.utils'
import { SmallDemarcheOutputDto } from '@/modules/demarches/objects/dtos/small-demarche-output.dto'
import { UserWithEditableRole } from '@/modules/users/objects/dtos/output'
import { UpdateOneRoleOptionDto } from '@/modules/users/objects/dtos/input'

//#region MOCK DEMARCHES
/*
   CULTE
      Démarche 1
      Démarche 2
   FDD
      Démarche 3
      Démarche 4
   FE
      Démarche 4
   AUCUN
      Démarche 5
 */
const allSmallDemarches: SmallDemarcheOutputDto[] = [
  {
    id: 1,
    dsId: 1,
    types: [eOrganismeType.CULTE],
    title: 'Démarche 1',
  },
  {
    id: 2,
    dsId: 2,
    types: [eOrganismeType.CULTE],
    title: 'Démarche 2',
  },
  {
    id: 3,
    dsId: 3,
    types: [eOrganismeType.FDD],
    title: 'Démarche 3',
  },
  {
    id: 4,
    dsId: 4,
    types: [eOrganismeType.FDD, eOrganismeType.FE],
    title: 'Démarche 4',
  },
  {
    id: 5,
    dsId: 5,
    types: [],
    title: 'Démarche 5',
  },
]
//#endregion

//#region MOCK USER
let useless = 100

const dumbUserFromRole = (role: IRole): IUser => ({
  id: useless++,
  email: `${useless}@test-unit.fr`,
  job: 'useless',
  lastname: 'useless',
  firstname: 'useless',
  validated: true,
  password: 'useless',
  updatedAt: new Date(),
  createdAt: new Date(),
  role,
})

const sudo: IUser = dumbUserFromRole({
  label: Roles.sudo,
  options: {},
})
const superAdmin: IUser = dumbUserFromRole({
  label: Roles.superadmin,
  options: {},
})
const emptyAdmin: IUser = dumbUserFromRole({
  label: Roles.admin,
  options: {},
})
const emptyInstructor: IUser = dumbUserFromRole({
  label: Roles.instructor,
  options: {},
})
//#endregion

describe('RoleUtils', () => {
  describe('generateUserWithEditableRole', () => {
    it('Should throw an error if editor its not an admin', () => {
      expect(() => {
        generateUserWithEditableRole(
          emptyInstructor,
          emptyInstructor,
          allSmallDemarches,
        )
      }).toThrow('Only admins can generate user for admin output')
    })

    it('Should return nothing editable if target is superadmin', () => {
      expect(
        generateUserWithEditableRole(
          superAdmin,
          superAdmin,
          allSmallDemarches,
        ),
      ).toMatchObject({
        originalUser: superAdmin,
        demarcheHash: Object.fromEntries(
          allSmallDemarches.map((sd, i) => [
            sd.id,
            {
              ...allSmallDemarches[i],
              checked: false,
              editable: false,
              prefectureOptions: {
                national: {
                  value: false,
                  editable: false,
                },
                prefectures: {
                  value: [],
                  deletable: [],
                  addable: [],
                },
              },
            },
          ]),
        ),
      })
    })

    it('Should return everything editable if editor is superadmin and target is instructor', () => {
      expect(
        generateUserWithEditableRole(
          superAdmin,
          emptyInstructor,
          allSmallDemarches,
        ),
      ).toMatchObject({
        originalUser: emptyInstructor,
        demarcheHash: Object.fromEntries(
          allSmallDemarches.map((sd, i) => [
            sd.id,
            {
              ...allSmallDemarches[i],
              checked: false,
              editable: true,
              prefectureOptions: {
                national: {
                  value: false,
                  editable: true,
                },
                prefectures: {
                  value: [],
                  deletable: [],
                  addable: [],
                },
              },
            },
          ]),
        ),
      })
    })

    it('Should return everything editable if editor is superadmin and target is admin', () => {
      expect(
        generateUserWithEditableRole(
          superAdmin,
          emptyAdmin,
          allSmallDemarches,
        ),
      ).toMatchObject({
        originalUser: emptyAdmin,
        demarcheHash: Object.fromEntries(
          allSmallDemarches.map((sd, i) => [
            sd.id,
            {
              ...allSmallDemarches[i],
              checked: false,
              editable: true,
              prefectureOptions: {
                national: {
                  value: false,
                  editable: true,
                },
                prefectures: {
                  value: [],
                  deletable: [],
                  addable: [],
                },
              },
            },
          ]),
        ),
      })
    })

    it('Should return everything editable and keep value of initial user', () => {
      const bobInstructor = dumbUserFromRole({
        label: Roles.instructor,
        options: {
          1: {
            national: true,
            prefectures: [],
          },
          3: {
            national: false,
            prefectures: [Prefecture.D57, Prefecture.D75],
          },
        },
      })
      expect(
        generateUserWithEditableRole(
          superAdmin,
          bobInstructor,
          allSmallDemarches,
        ),
      ).toMatchObject({
        originalUser: bobInstructor,
        demarcheHash: Object.fromEntries(
          allSmallDemarches.map((sd, i) => [
            sd.id,
            {
              ...allSmallDemarches[i],
              editable: true,
              checked: bobInstructor.role.options[sd.id] !== undefined,
              prefectureOptions: {
                national: {
                  value: bobInstructor.role.options[sd.id]?.national ?? false,
                  editable: true,
                },
                prefectures: {
                  value: bobInstructor.role.options[sd.id]?.prefectures ?? [],
                  deletable: [],
                  addable: [],
                },
              },
            },
          ]),
        ),
      })
    })

    it('National Admin should be able to add national empty user', () => {
      const customAdmin = dumbUserFromRole({
        label: Roles.admin,
        options: {
          1: {
            national: true,
            prefectures: [],
          },
        },
      })
      const result = generateUserWithEditableRole(
        customAdmin,
        emptyInstructor,
        allSmallDemarches,
      )
      expect(result.demarcheHash[1]).toMatchObject({
        ...allSmallDemarches[0],
        checked: false,
        editable: true,
        prefectureOptions: {
          national: {
            value: false,
            editable: true,
          },
          prefectures: {
            value: [],
            deletable: [],
            addable: [],
          },
        },
      })
    })

    it('National Admin should be able to unchecked demarche', () => {
      const customAdmin = dumbUserFromRole({
        label: Roles.admin,
        options: {
          1: {
            national: true,
            prefectures: [],
          },
        },
      })
      const bobInstructor = dumbUserFromRole({
        label: Roles.instructor,
        options: {
          1: {
            national: false,
            prefectures: [Prefecture.D57],
          },
        },
      })
      const result = generateUserWithEditableRole(
        customAdmin,
        bobInstructor,
        allSmallDemarches,
      )
      expect(result.demarcheHash[1]).toMatchObject({
        ...allSmallDemarches[0],
        checked: true,
        editable: true,
        prefectureOptions: {
          national: {
            value: false,
            editable: true,
          },
          prefectures: {
            value: [Prefecture.D57],
            deletable: [],
            addable: [],
          },
        },
      })
    })

    it('Prefecture Admin should be able to add its own prefecture to empty user', () => {
      const customAdmin = dumbUserFromRole({
        label: Roles.admin,
        options: {
          1: {
            national: false,
            prefectures: [Prefecture.D57, Prefecture.D75],
          },
        },
      })
      const result = generateUserWithEditableRole(
        customAdmin,
        emptyInstructor,
        allSmallDemarches,
      )
      expect(result.demarcheHash[1]).toMatchObject({
        ...allSmallDemarches[0],
        checked: false,
        editable: true,
        prefectureOptions: {
          national: {
            value: false,
            editable: false,
          },
          prefectures: {
            value: [],
            deletable: [],
            addable: [Prefecture.D57, Prefecture.D75],
          },
        },
      })
    })

    it('Prefecture Admin should be able to delete its own prefecture to empty user', () => {
      const customAdmin = dumbUserFromRole({
        label: Roles.admin,
        options: {
          1: {
            national: false,
            prefectures: [Prefecture.D57, Prefecture.D75],
          },
        },
      })
      const bobInstructor = dumbUserFromRole({
        label: Roles.instructor,
        options: {
          1: {
            national: false,
            prefectures: [Prefecture.D57, Prefecture.D75],
          },
        },
      })
      const result = generateUserWithEditableRole(
        customAdmin,
        bobInstructor,
        allSmallDemarches,
      )
      expect(result.demarcheHash[1]).toMatchObject({
        ...allSmallDemarches[0],
        checked: true,
        editable: true,
        prefectureOptions: {
          national: {
            value: false,
            editable: false,
          },
          prefectures: {
            value: [Prefecture.D57, Prefecture.D75],
            deletable: [Prefecture.D57, Prefecture.D75],
            addable: [],
          },
        },
      })
    })

    it('Prefecture Admin should not be able to edit national Instructor', () => {
      const customAdmin = dumbUserFromRole({
        label: Roles.admin,
        options: {
          1: {
            national: false,
            prefectures: [Prefecture.D57, Prefecture.D75],
          },
        },
      })
      const bobInstructor = dumbUserFromRole({
        label: Roles.instructor,
        options: {
          1: {
            national: true,
            prefectures: [],
          },
        },
      })
      const result = generateUserWithEditableRole(
        customAdmin,
        bobInstructor,
        allSmallDemarches,
      )
      expect(result.demarcheHash[1]).toMatchObject({
        ...allSmallDemarches[0],
        checked: true,
        editable: false,
        prefectureOptions: {
          national: {
            value: true,
            editable: false,
          },
          prefectures: {
            value: [],
            deletable: [],
            addable: [],
          },
        },
      })
    })

    it('Prefecture Admin should not be able to uncheck wider prefecture Instructor', () => {
      const customAdmin = dumbUserFromRole({
        label: Roles.admin,
        options: {
          1: {
            national: false,
            prefectures: [Prefecture.D57, Prefecture.D75],
          },
        },
      })
      const bobInstructor = dumbUserFromRole({
        label: Roles.instructor,
        options: {
          1: {
            national: false,
            prefectures: [Prefecture.D57, Prefecture.D30],
          },
        },
      })
      const result = generateUserWithEditableRole(
        customAdmin,
        bobInstructor,
        allSmallDemarches,
      )
      expect(result.demarcheHash[1]).toMatchObject({
        ...allSmallDemarches[0],
        checked: true,
        editable: false,
        prefectureOptions: {
          national: {
            value: false,
            editable: false,
          },
          prefectures: {
            value: [Prefecture.D57, Prefecture.D30],
            deletable: [Prefecture.D57],
            addable: [Prefecture.D75],
          },
        },
      })
    })
  })

  describe('isEditionAllowed', () => {
    const openEditionForEmptyInstructor: UserWithEditableRole = {
      originalUser: emptyInstructor,
      deletable: false,
      possibleRoles: [],
      demarcheHash: Object.fromEntries(
        allSmallDemarches.map((sd, i) => [
          sd.id,
          {
            ...allSmallDemarches[i],
            checked: false,
            editable: true,
            prefectureOptions: {
              national: {
                value: false,
                editable: true,
              },
              prefectures: {
                value: [],
                deletable: [],
                addable: [],
              },
            },
          },
        ]),
      ),
    }
    it('Shouldn\'t be able to edit superadmin', () => {
      expect(isEditionAllowed(
        {
          demarcheId: 1,
          checked: true,
        } as UpdateOneRoleOptionDto,
        {
          originalUser: superAdmin,
          deletable: false,
          possibleRoles: [],
          demarcheHash: openEditionForEmptyInstructor.demarcheHash,
        },
      )).toBeFalsy()
    })
    it('Shouldn\'t be able to check', () => {
      const editable = { ...openEditionForEmptyInstructor }
      editable.demarcheHash[1].editable = false
      expect(isEditionAllowed(
        {
          demarcheId: 1,
          checked: false,
        } as UpdateOneRoleOptionDto,
        editable,
      )).toBeFalsy()
    })
    it('Should be able to check', () => {
      const editable = { ...openEditionForEmptyInstructor }
      editable.demarcheHash[1].editable = true
      expect(isEditionAllowed(
        {
          demarcheId: 1,
          checked: false,
        } as UpdateOneRoleOptionDto,
        editable,
      )).toBeTruthy()
    })
    it('Shouldn\'t be able to check national', () => {
      const editable = { ...openEditionForEmptyInstructor }
      editable.demarcheHash[1].prefectureOptions.national.editable = false
      expect(isEditionAllowed(
        {
          demarcheId: 1,
          national: true,
        } as UpdateOneRoleOptionDto,
        editable,
      )).toBeFalsy()
    })
    it('Should be able to check national', () => {
      const editable = { ...openEditionForEmptyInstructor }
      editable.demarcheHash[1].prefectureOptions.national.editable = true
      expect(isEditionAllowed(
        {
          demarcheId: 1,
          national: true,
        } as UpdateOneRoleOptionDto,
        editable,
      )).toBeTruthy()
    })
    it('Shouldn\'t be able to check add pref', () => {
      const editable = { ...openEditionForEmptyInstructor }
      editable.demarcheHash[1].prefectureOptions.prefectures.addable = [Prefecture.D57]
      expect(isEditionAllowed(
        {
          demarcheId: 1,
          prefecture: {
            toAdd: true,
            key: Prefecture.D75,
          },
        } as UpdateOneRoleOptionDto,
        editable,
      )).toBeFalsy()
    })
    it('Should be able to check add pref if national', () => {
      const editable = { ...openEditionForEmptyInstructor }
      editable.demarcheHash[1].prefectureOptions.national.editable = true
      expect(isEditionAllowed(
        {
          demarcheId: 1,
          prefecture: {
            toAdd: true,
            key: Prefecture.D57,
          },
        } as UpdateOneRoleOptionDto,
        editable,
      )).toBeTruthy()
    })
    it('Should be able to check add pref', () => {
      const editable = { ...openEditionForEmptyInstructor }
      editable.demarcheHash[1].prefectureOptions.prefectures.addable = [Prefecture.D57]
      expect(isEditionAllowed(
        {
          demarcheId: 1,
          prefecture: {
            toAdd: true,
            key: Prefecture.D57,
          },
        } as UpdateOneRoleOptionDto,
        editable,
      )).toBeTruthy()
    })
    it('Shouldn\'t be able to check del pref', () => {
      const editable = { ...openEditionForEmptyInstructor }
      editable.demarcheHash[1].prefectureOptions.prefectures.deletable = [Prefecture.D57]
      expect(isEditionAllowed(
        {
          demarcheId: 1,
          prefecture: {
            toAdd: false,
            key: Prefecture.D75,
          },
        } as UpdateOneRoleOptionDto,
        editable,
      )).toBeFalsy()
    })
    it('Should be able to check del pref', () => {
      const editable = { ...openEditionForEmptyInstructor }
      editable.demarcheHash[1].prefectureOptions.prefectures.deletable = [Prefecture.D75]
      expect(isEditionAllowed(
        {
          demarcheId: 1,
          prefecture: {
            toAdd: false,
            key: Prefecture.D75,
          },
        } as UpdateOneRoleOptionDto,
        editable,
      )).toBeTruthy()
    })
  })

  describe('generateRoleAttributionList', () => {
    it('Should throw an error if editor its not an admin', () => {
      expect(() => {
        generateRoleAttributionList(emptyInstructor, emptyInstructor)
      }).toThrow('Only an admin can generate role attribution list')
    })

    it('Should return empty array if target is superadmin', () => {
      expect(generateRoleAttributionList(superAdmin, superAdmin)).toEqual([])
    })

    it('Should return complete array if editor is sudo', () => {
      expect(generateRoleAttributionList(sudo, emptyAdmin))
        .toEqual(threeRoles)
    })

    it('Should return complete array if editor is superadmin', () => {
      expect(generateRoleAttributionList(superAdmin, emptyAdmin))
        .toEqual(threeRoles)
    })

    it('Should return admin and instructor if target is contained', () => {
      expect(generateRoleAttributionList(emptyAdmin, emptyInstructor))
        .toEqual([Roles.instructor, Roles.admin])
    })

    it('Should return [] if target is not contained - 1', () => {
      const bob = dumbUserFromRole({
        label: Roles.instructor,
        options: {
          1: {
            national: true,
            prefectures: [],
          },
          3: {
            national: false,
            prefectures: [Prefecture.D57, Prefecture.D75],
          },
        },
      })
      const alice = dumbUserFromRole({
        label: Roles.admin,
        options: {
          3: {
            national: true,
            prefectures: [],
          },
        },
      })
      expect(generateRoleAttributionList(alice, bob))
        .toEqual([])
    })

    it('Should return [] if target is not contained - 2', () => {
      const bob = dumbUserFromRole({
        label: Roles.instructor,
        options: {
          1: {
            national: true,
            prefectures: [],
          },
          3: {
            national: false,
            prefectures: [Prefecture.D57, Prefecture.D75],
          },
        },
      })
      const alice = dumbUserFromRole({
        label: Roles.admin,
        options: {
          1: {
            national: false,
            prefectures: [Prefecture.D57],
          },
          3: {
            national: true,
            prefectures: [],
          },
        },
      })
      expect(generateRoleAttributionList(alice, bob))
        .toEqual([])
    })

    it('Should return [] if target is not contained - 3', () => {
      const bob = dumbUserFromRole({
        label: Roles.instructor,
        options: {
          1: {
            national: true,
            prefectures: [],
          },
          3: {
            national: false,
            prefectures: [Prefecture.D57, Prefecture.D75],
          },
        },
      })
      const alice = dumbUserFromRole({
        label: Roles.admin,
        options: {
          1: {
            national: true,
            prefectures: [],
          },
          3: {
            national: false,
            prefectures: [Prefecture.D75, Prefecture.D30],
          },
        },
      })
      expect(generateRoleAttributionList(alice, bob))
        .toEqual([])
    })

    it('Should return [Admin, Instructor] if target is contained (complex)', () => {
      const bob = dumbUserFromRole({
        label: Roles.instructor,
        options: {
          1: {
            national: true,
            prefectures: [],
          },
          3: {
            national: false,
            prefectures: [Prefecture.D57, Prefecture.D75],
          },
          4: {
            national: false,
            prefectures: [Prefecture.D30],
          },
        },
      })
      const alice = dumbUserFromRole({
        label: Roles.admin,
        options: {
          1: {
            national: true,
            prefectures: [],
          },
          3: {
            national: false,
            prefectures: [Prefecture.D57, Prefecture.D75, Prefecture.D30],
          },
          4: {
            national: true,
            prefectures: [],
          },
        },
      })
      expect(generateRoleAttributionList(alice, bob))
        .toEqual([Roles.instructor, Roles.admin])
    })

    it('Should return all role if target is superadmin and editor is sudo', () => {
      expect(generateRoleAttributionList(sudo, superAdmin))
        .toEqual(threeRoles)
    })
  })
})
