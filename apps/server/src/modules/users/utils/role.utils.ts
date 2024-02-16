
import {
  isAtLeastAdmin,
  isBelowSuperAdmin,
  IRoleOption,
  isSuperiorOrSimilar,
  RolesKeys,
  Roles,
  IUser,
} from '@biblio-num/shared-utils'

import { isDefined } from 'class-validator'
import { OneDemarcheRoleOption, UserWithEditableRole } from '@/modules/users/objects/dtos/output'
import { SmallDemarcheOutputDto } from '@/modules/demarches/objects/dtos/small-demarche-output.dto'
import { UpdateOneRoleOptionDto } from '@/modules/users/objects/dtos/input'

export const threeRoles = [Roles.superadmin, Roles.admin, Roles.instructor]

const _oneDemarcheRoleOptionNotEditable = (
  demarche: SmallDemarcheOutputDto,
  option: IRoleOption | undefined,
): OneDemarcheRoleOption => ({
  ...demarche,
  checked: !!option,
  editable: false,
  prefectureOptions: {
    national: {
      value: option?.national ?? false,
      editable: false,
    },
    prefectures: {
      value: option?.prefectures ?? [],
      deletable: [],
      addable: [],
    },
  },
})

const _isDemarcheEditable = (
  editorRoleOptions: IRoleOption | undefined,
  targetRoleOption: IRoleOption | undefined,
): boolean => {
  if (!editorRoleOptions) return false
  if (!targetRoleOption) return true
  if (editorRoleOptions.national) return true
  if (targetRoleOption.national) return false
  return (targetRoleOption.prefectures ?? []).every((p) =>
    (editorRoleOptions.prefectures ?? []).includes(p),
  )
}

export const generateUserWithEditableRole = (
  editor: IUser,
  target: IUser,
  allDemarches: SmallDemarcheOutputDto[],
): UserWithEditableRole => {
  if (!isAtLeastAdmin(editor.role.label)) {
    throw new Error('Only admins can generate user for admin output')
  }
  const hash: Record<number, OneDemarcheRoleOption> = Object.fromEntries(
    allDemarches.map((demarche) => [
      demarche.id,
      _oneDemarcheRoleOptionNotEditable(
        demarche,
        target.role.options[demarche.id],
      ),
    ]),
  )
  if (isBelowSuperAdmin(target.role.label)) {
    if (isSuperiorOrSimilar(Roles.superadmin, editor.role.label)) {
      Object.values(hash).forEach((value) => {
        value.editable = true
        value.prefectureOptions.national.editable = true
      })
    } else {
      Object.values(hash).forEach((value) => {
        value.editable = _isDemarcheEditable(
          editor.role.options[value.id],
          target.role.options[value.id],
        )
        const national = editor.role.options[value.id]?.national ?? false
        value.prefectureOptions.national.editable = national
        if (!national) {
          const userPrefectures =
            target.role.options[value.id]?.prefectures ?? []
          const adminPrefectures =
            editor.role.options[value.id]?.prefectures ?? []
          if (!target.role.options[value.id]?.national) {
            value.prefectureOptions.prefectures.addable =
              adminPrefectures.filter((p) => !userPrefectures.includes(p))
            value.prefectureOptions.prefectures.deletable =
              userPrefectures.filter((p) => adminPrefectures.includes(p))
          }
        }
      })
    }
  }
  const possibleRoles = generateRoleAttributionList(editor, target)
  return {
    originalUser: target,
    possibleRoles,
    deletable: isRoleDeletable(possibleRoles),
    demarcheHash: hash,
  }
}

export const isEditionAllowed = (
  roleEdit: UpdateOneRoleOptionDto,
  userWithEditableRole: UserWithEditableRole,
): boolean => {
  const { originalUser, demarcheHash } = userWithEditableRole
  const option = demarcheHash[roleEdit.demarcheId]
  if (!option) return false
  if (!isBelowSuperAdmin(originalUser.role.label)) return false
  if (isDefined(roleEdit.checked) && !option.editable) return false
  if (
    isDefined(roleEdit.national) &&
    !option.prefectureOptions.national.editable
  ) {
    return false
  }
  if (isDefined(roleEdit.prefecture)) {
    if (roleEdit.prefecture.toAdd) {
      return option.prefectureOptions.prefectures.addable.includes(
        roleEdit.prefecture.key,
      )
    } else {
      return option.prefectureOptions.prefectures.deletable.includes(
        roleEdit.prefecture.key,
      )
    }
  }
  return true
}

const _isTargetRoleOptionContainedInAdminRoleOption = (
  editor: Record<number, IRoleOption>,
  target: Record<number, IRoleOption>,
): boolean => {
  for (const [demarcheId, oneRoleOption] of Object.entries(target)) {
    if (!editor[demarcheId]) {
      return false
    }
    if (oneRoleOption.national && !editor[demarcheId].national) {
      return false
    }
    if (
      !oneRoleOption.national &&
      !editor[demarcheId].national &&
      !oneRoleOption.prefectures.every((p) =>
        editor[demarcheId].prefectures.includes(p),
      )
    ) {
      return false
    }
  }
  return true
}

export const generateRoleAttributionList = (
  editor: IUser,
  target: IUser,
): RolesKeys[] => {
  if (!isSuperiorOrSimilar(Roles.admin, editor.role.label)) {
    throw new Error('Only an admin can generate role attribution list')
  }
  if (editor.role.label === Roles.sudo) {
    return threeRoles
  }
  if (target.role.label === Roles.superadmin) {
    return []
  }
  if (isSuperiorOrSimilar(Roles.superadmin, editor.role.label)) {
    return threeRoles
  }
  return _isTargetRoleOptionContainedInAdminRoleOption(
    editor.role.options,
    target.role.options,
  )
    ? [Roles.instructor, Roles.admin]
    : []
}

export const isRoleDeletable = (
  possibleRoles: RolesKeys[],
): boolean => (!!possibleRoles.length)
