import {
  isAtLeastAdmin,
  SmallDemarcheOutputDto,
  UserWithEditableRole,
  OneDemarcheRoleOption,
  Roles,
  isBelowSuperAdmin,
  IRoleOption,
  IUser,
} from '@biblio-num/shared'

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
  const tPrefectures = targetRoleOption.prefectures ?? []
  const ePrefectures = editorRoleOptions.prefectures ?? []
  return tPrefectures.every((p) => ePrefectures.includes(p))
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
    if (editor.role.label === Roles.superadmin) {
      Object.entries(hash).forEach(([, value]) => {
        value.editable = true
        value.prefectureOptions.national.editable = true
      })
    } else {
      Object.entries(hash).forEach(([, value]) => {
        value.editable = _isDemarcheEditable(editor.role.options[value.id], target.role.options[value.id])
        const national = editor.role.options[value.id]?.national ?? false
        value.prefectureOptions.national.editable = national
        if (!national) {
          const userPrefectures =
              target.role.options[value.id]?.prefectures ?? []
          const adminPrefectures =
              editor.role.options[value.id]?.prefectures ?? []
          if (!target.role.options[value.id]?.national) {
            value.prefectureOptions.prefectures.addable = adminPrefectures.filter(
              (p) => !userPrefectures.includes(p),
            )
            value.prefectureOptions.prefectures.deletable =
              userPrefectures.filter((p) => adminPrefectures.includes(p))
          }
        }
      })
    }
  }
  return {
    originalUser: target,
    demarcheHash: hash,
  }
}
