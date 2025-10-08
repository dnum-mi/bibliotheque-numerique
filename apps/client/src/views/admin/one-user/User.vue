<script lang="ts" setup>
import type {
  OneDemarcheRoleOption,
  IOnePrefectureUpdate,
  IPrefectureOptions,
  IUserOutput,
  IUserWithEditableRole,
  OrganismeTypeKey,
  IUpdateOneRoleOption,
} from '@biblio-num/shared'

import { eOrganismeType, listOfPrefectureKeys, Roles } from '@biblio-num/shared'

import { useUserStore } from '@/stores'
import { useRandomId } from '@gouvminint/vue-dsfr'
import { computed, ref } from 'vue'
import DemarcheLocalization from './DemarcheLocalization.vue'

import UserGeographicalRights from './UserGeographicalRights.vue'
import { LocalizationOptions } from './localization.enum'
import type { LocalizationOptionsKeys } from './localization.enum'

import UserRole from './UserRole.vue'
import GeneratePasswordLinkModal from './GeneratePasswordLinkModal.vue'

const props = defineProps<{ selectedEditableUser: IUserWithEditableRole }>()

//#region Types, Mapping, Enum
type DemarcheHtmlAttrs = {
  class?: string | null
  disabled?: boolean | null
}
type DemarcheRole = {
  options: OneDemarcheRoleOption
  attrs: DemarcheHtmlAttrs
}
type DemarchesRoles = {
  label: string
  name: OrganismeTypeKey
  value: boolean
  key: string
  localization?: IPrefectureOptions
  commonPrefectureValues: string[]
  commonPrefectureAddables: string[]
  commonPrefectureDeletables: string[]
  children?: DemarcheRole[]
  attrs: DemarcheHtmlAttrs
}
type GeographicalRights = IPrefectureOptions & { enabled?: boolean }

const typeOrganismeLabel: Record<OrganismeTypeKey, string> = {
  [eOrganismeType.ASSO]: 'Associations',
  [eOrganismeType.FDD]: 'Fonds de dotation (FDD)',
  [eOrganismeType.FE]: 'Fondations d’entreprises (FE)',
  [eOrganismeType.FRUP]: 'Fondations reconnues d’utilité publique (FRUP)',
  [eOrganismeType.unknown]: 'Type d’organisme inconnu',
}
//#endregion
let noRefDemarcheOrTypeSelected: DemarchesRoles | DemarcheRole | DemarchesRoles[]
const userStore = useUserStore()
const currentUser = computed<IUserOutput | null>(() => userStore.currentUser)
const selectedUser = computed<IUserOutput>(() => props.selectedEditableUser.originalUser)
const demarcheHash = computed<Record<number, OneDemarcheRoleOption>>(() => props.selectedEditableUser.demarcheHash)
const keySelectUser = computed<string>(() => userStore.keySelectUser)
const loading = computed<boolean>(() => userStore.selectedEditableUserLoading)
const isSuperAdmin = computed<boolean>(() => {
  return selectedUser.value.role.label === Roles.superadmin
})
const isCurrentUserSuperAdmin = computed<boolean>(() => {
  return !!(currentUser.value?.role?.label && currentUser.value.role.label === Roles.sudo)
})
//#region Tous les démarches
const allDemarchesRolesChildren = computed(() => demarchesRoles.value.flatMap((dr) => dr.children).filter((children) => !!children))

const selectedAllDemarchesAttr = ref<string | null>(null)
const isAllDemarches = computed(() => !allDemarchesRolesChildren.value.some((child) => !child.options.checked))
// #endRegion

//#region View Demarches
const isAllCheck = (children: DemarcheRole[]): boolean =>
  children.reduce((val, demarche) => {
    return (val &&= demarche.options.checked)
  }, true)

const getCommonPrefectureOptionGetter = (children: DemarcheRole[]) => (prop: 'addable' | 'value' | 'deletable') => {
  return children
    .map((child) => child.options.prefectureOptions.prefectures[prop])
    .reduce(
      (acc, cur) => {
        return cur.filter((pref) => acc.includes(pref))
      },
      [...listOfPrefectureKeys],
    )
}

const organismeTypes = computed(() => [
  ...new Set(
    Object.values(demarcheHash.value || {})
      .map(({ types }) => (types.length ? types : [eOrganismeType.unknown]))
      .flat()
      .sort((a, b) => (a === eOrganismeType.unknown ? 1 : b === eOrganismeType.unknown ? -1 : 0)),
  ),
])

const demarchesRoles = computed<DemarchesRoles[]>(() => {
  return organismeTypes.value
    .map((type) => {
      const localization: IPrefectureOptions = {
        national: {
          value: true,
          editable: true,
        },
        prefectures: {
          value: [],
          addable: [],
          deletable: [],
        },
      }
      const children = Object.values(demarcheHash.value || {})
        .concat(
          Object.values(demarcheHash.value || {})
            .filter((demarcheOption) => demarcheOption.types.length === 0)
            .map((dOpts) => ({ ...dOpts, types: [eOrganismeType.unknown] })),
        )
        .filter((demarcheOption) => demarcheOption.types.includes(type))
        .filter((d) => d.editable)
        .map((d): DemarcheRole => {
          localization.national.value &&= d.prefectureOptions.national.value
          localization.national.editable &&= d.prefectureOptions.national.editable

          let newClass: string | null | undefined = null
          if ((noRefDemarcheOrTypeSelected as DemarcheRole)?.options?.id === d.id) {
            newClass = noRefDemarcheOrTypeSelected?.attrs.class
          }

          return {
            options: d,
            attrs: {
              class: newClass ?? null,
              disabled: !d.editable,
            },
          }
        })

      const value = isAllCheck(children)

      const getCommonPrefectureOptionsFor = getCommonPrefectureOptionGetter(children)

      const commonPrefectureValues: string[] = getCommonPrefectureOptionsFor('value')
      const commonPrefectureAddables: string[] = getCommonPrefectureOptionsFor('addable')
      const commonPrefectureDeletables: string[] = getCommonPrefectureOptionsFor('deletable')

      let newClass: string | null | undefined = null
      if ((noRefDemarcheOrTypeSelected as DemarchesRoles)?.name === type) {
        newClass = noRefDemarcheOrTypeSelected?.attrs.class
      }

      return {
        label: typeOrganismeLabel[type] || typeOrganismeLabel[eOrganismeType.unknown],
        name: type,
        value,
        key: useRandomId(type),
        localization,
        children,
        commonPrefectureValues,
        commonPrefectureAddables,
        commonPrefectureDeletables,
        attrs: {
          class: newClass ?? null,
          disabled: children?.some((d) => !d.options.editable),
        },
      }
    })
    .filter((type) => type.children && type.children.length)
})

const deduceCheckTypeFromChild = (id: number) => {
  if (!demarcheHash.value[id]?.types) {
    return
  }
  demarcheHash.value[id].types.forEach((type: string) => {
    const objType = demarchesRoles.value.filter((dr) => dr.name === type)[0]
    if (!objType || !objType.children) {
      return
    }
    objType.value = isAllCheck(objType.children)
  })
}

const checkAllTypeChildren = async ({ name, checked, dr }: { name: string; checked: boolean; dr: DemarchesRoles }) => {
  dr.value = checked
  if (!checked || !dr.children) {
    return
  }
  await userStore.updateUserRolesOption(
    dr.children?.map((child) => {
      child.options.checked = checked
      deduceCheckTypeFromChild(child.options.id)
      return {
        demarcheId: child.options.id,
        checked,
      }
    }),
    false,
  )

  dr.key = useRandomId(name)
  if (selectedUser.value?.id) {
    await userStore.loadUserById(selectedUser.value?.id)
  }
}

const checkOneDemarche = async (obj: { id: number; checked: boolean; d: DemarcheRole; reloadUser?: boolean }) => {
  obj.d.options.checked = obj.checked
  deduceCheckTypeFromChild(obj.id)
  await userStore.updateUserOneRoleOption(
    {
      demarcheId: obj.d.options.id,
      checked: obj.checked,
    },
    obj.reloadUser ?? true,
  )
}

const demarcheOrTypeSelected = ref<DemarchesRoles | DemarcheRole | DemarchesRoles[] | null>(null)

const initClassSelected = () => {
  selectedAllDemarchesAttr.value = null
  demarchesRoles.value.forEach((dr) => {
    dr.attrs.class = null
    dr.children?.forEach((d) => {
      d.attrs.class = null
    })
  })
}

const onClickDemarches = (elt: DemarchesRoles | DemarcheRole) => {
  if (elt.attrs.disabled) {
    return
  }

  initClassSelected()

  elt.attrs.class = 'fr-background-contrast--info'
  demarcheOrTypeSelected.value = elt
  noRefDemarcheOrTypeSelected = elt
}
//#endregion

//#region Tous les démarches
const onClickAllDemarches = () => {
  initClassSelected()

  selectedAllDemarchesAttr.value = 'fr-background-contrast--info'

  demarcheOrTypeSelected.value = demarchesRoles.value
  noRefDemarcheOrTypeSelected = demarchesRoles.value
}
const checkAllDemarches = async (checked: boolean) => {
  if (!checked) {
    return
  }
  const demarchesToUpdate: IUpdateOneRoleOption[] = allDemarchesRolesChildren.value.flatMap((children) => ({
    demarcheId: children.options.id,
    checked: true,
  }))

  await userStore.updateUserRolesOption(demarchesToUpdate, false)

  if (selectedUser.value?.id) {
    await userStore.loadUserById(selectedUser.value?.id)
  }

  onClickAllDemarches()
}
//#endregion

//#region view localization
const geographicalRights = computed<GeographicalRights | null>(() => {
  if (!demarcheOrTypeSelected.value) {
    return null
  }
  if ('options' in demarcheOrTypeSelected.value) {
    const id: number = demarcheOrTypeSelected.value.options.id
    if (!demarcheHash.value) {
      return null
    }
    return {
      ...demarcheHash.value[id].prefectureOptions,
      enabled: demarcheHash.value[id].checked,
    }
  }

  if ('name' in demarcheOrTypeSelected.value) {
    const drSelected = demarchesRoles.value.find((dr) => dr.name === (demarcheOrTypeSelected.value as DemarchesRoles).name)
    return {
      national: {
        value: drSelected?.localization?.national.value ?? false,
        editable: drSelected?.localization?.national.editable ?? false,
      },
      prefectures: {
        value: drSelected?.commonPrefectureValues,
        addable: drSelected?.commonPrefectureAddables,
        deletable: drSelected?.commonPrefectureDeletables,
      },
      enabled: drSelected?.value,
    } as GeographicalRights
  }

  return demarchesRoles.value
    .flatMap((dr) => dr.children)
    .filter((child) => !!child)
    .reduce(
      (acc, cur) => {
        acc.national.editable &&= cur.options.prefectureOptions.national.editable
        acc.national.value &&= cur.options.prefectureOptions.national.value

        acc.prefectures.value = acc.prefectures.value.filter((pref) => cur.options.prefectureOptions.prefectures.value.includes(pref))
        acc.prefectures.deletable = acc.prefectures.deletable.filter((pref) =>
          cur.options.prefectureOptions.prefectures.deletable.includes(pref),
        )
        acc.prefectures.addable = acc.prefectures.addable.filter((pref) => cur.options.prefectureOptions.prefectures.addable.includes(pref))

        return acc
      },
      {
        national: {
          value: true,
          editable: true,
        },
        prefectures: {
          value: demarchesRoles.value[0]?.commonPrefectureValues,
          addable: demarchesRoles.value[0]?.commonPrefectureAddables,
          deletable: demarchesRoles.value[0]?.commonPrefectureDeletables,
        },
        enabled: isAllDemarches.value,
      } as GeographicalRights,
    )
})

const _updateGeographicalRight = async (optionLoc: { national?: boolean; prefecture?: IOnePrefectureUpdate }) => {
  if (!demarcheOrTypeSelected.value) {
    return null
  }

  const demarcheSelected: DemarcheRole | null = 'options' in demarcheOrTypeSelected.value ? demarcheOrTypeSelected.value : null
  const typeSelected: DemarchesRoles | null = 'options' in demarcheOrTypeSelected.value ? null : (demarcheOrTypeSelected.value as DemarchesRoles)

  if (demarcheSelected) {
    await userStore.updateUserOneRoleOption(
      {
        demarcheId: demarcheSelected.options.id,
        ...optionLoc,
      },
      true,
    )
  } else if (typeSelected && typeSelected.children) {
    await userStore.updateUserRolesOption(
      typeSelected.children?.map((child) => {
        return {
          demarcheId: child.options.id,
          ...optionLoc,
        }
      }),
      false,
    )
    await userStore.loadUserById(selectedUser.value?.id)
  } else if (Array.isArray(demarcheOrTypeSelected.value) && demarcheOrTypeSelected.value[0].label) {
    const childrenChecked = demarcheOrTypeSelected.value
      .flatMap((dr) => dr.children)
      .filter((child) => !!child)
      .filter((child) => child.options.checked)
      .flatMap((child) => child.options.id)

    if (!childrenChecked) {
      return
    }
    const uniqChildren = [...new Set(childrenChecked)]

    await userStore.updateUserRolesOption(
      uniqChildren.map((demarcheId) => {
        return {
          demarcheId,
          ...optionLoc,
        }
      }),
      true,
    )
  }
}

const updatePrefecture = (option: IOnePrefectureUpdate) => _updateGeographicalRight({ prefecture: option })

const updateNational = (loc: LocalizationOptionsKeys) => _updateGeographicalRight({ national: loc === LocalizationOptions.national })

const addPrefecture = (prefecture: IOnePrefectureUpdate['key']) => {
  return updatePrefecture({
    key: prefecture,
    toAdd: true,
  })
}

const removePrefecture = (prefecture: IOnePrefectureUpdate['key']) => {
  return updatePrefecture({
    key: prefecture,
    toAdd: false,
  })
}
//#endregion
</script>

<template>
  <div class="flex flex-row bn-sub-title justify-between items-center fr-py-2v fr-px-4v mb-0">
    <div
      :key="keySelectUser"
      class="flex flex-row gap-4 flex-wrap"
    >
      <div>
        <label class="bn-fiche-sub-title--label">Courriel</label>
        <span class="text-xl">{{ selectedUser.email }}</span>
      </div>
      <div v-if="!!selectedUser?.firstname || !!selectedUser?.lastname">
        <label class="bn-fiche-sub-title--label">Nom complet</label>
        <span class="text-xl">{{ selectedUser.firstname || '' }} {{ selectedUser.lastname || '' }}</span>
      </div>
      <div v-if="!!selectedUser?.prefecture">
        <label class="bn-fiche-sub-title--label">Préfecture</label>
        <span class="text-xl">{{ selectedUser.prefecture }}</span>
      </div>
      <div v-if="!!selectedUser?.job">
        <label class="bn-fiche-sub-title--label">Fonction</label>
        <span class="text-xl">{{ selectedUser.job }}</span>
      </div>
    </div>
    <GeneratePasswordLinkModal
      v-if="isCurrentUserSuperAdmin"
      :user-id="selectedUser.id"
    />
  </div>

  <div class="fr-container relative">
    <div
      class="flex flex-row gap-10 max-w-screen"
      :class="{ 'blur-2': loading }"
    >
      <div class="fb-1/5 fr-py-4v flex-shrink-0">
        <h5>Rôle</h5>
        <div class="fr-pl-4v">
          <UserRole />
        </div>
      </div>
      <div class="fb-1/2 flex-grow-0 flex-shrink-0 fr-py-4v">
        <h5 class="">Démarches</h5>
        <template v-if="isSuperAdmin">
          <p>
            En tant que Super Administrateur, cet utilisateur dispose automatiquement de tous les droits d'accès à l'ensemble des démarches
            et des localisations
          </p>
        </template>
        <template v-else>
          <template v-if="selectedEditableUser?.originalUser.role.label">
            <div
              v-if="demarchesRoles.length > 0"
              class="flex no-flex-grow-for-checkboxes"
              :class="selectedAllDemarchesAttr"
              @click="onClickAllDemarches"
            >
              <DsfrCheckbox
                label=""
                class="fr-pr-2v"
                :disabled="isAllDemarches ? 'disabled' : false"
                :model-value="isAllDemarches"
                @update:model-value="checkAllDemarches($event)"
              />
              <label class="cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap"> Toutes les démarches </label>
            </div>
            <div v-else>
              <p>Vous n'avez pas de démarches à paramétrer pour ce rôle.</p>
            </div>
            <fieldset
              v-for="dr in demarchesRoles"
              :key="dr.name"
              class="my-2 rounded border-1 border-solid border-gray-400 max-w-full"
            >
              <legend
                class="flex flex-row justify-between rounded-lg no-margin-bottom"
                :class="dr.attrs?.class"
                @click="onClickDemarches(dr)"
              >
                <DsfrCheckbox
                  class="fr-px-2v flex-auto"
                  :name="dr.name"
                  :model-value="dr.value"
                  :disabled="dr.attrs.disabled"
                  @update:model-value="checkAllTypeChildren({ name: dr.name, checked: $event, dr })"
                />
                <label class="flex-shrink-0 cursor-pointer fr-text--bold">
                  {{ dr.label }}
                </label>

                <div
                  v-if="dr.localization?.national.value || dr.commonPrefectureValues.length"
                  class="fr-px-2v"
                >
                  <DemarcheLocalization
                    :key="dr.key"
                    class="max-w-[20rem] overflow-auto flex-auto"
                    :national="dr.localization?.national.value"
                    :prefectures="dr.commonPrefectureValues"
                  />
                </div>
              </legend>
              <div
                v-if="dr.children"
                class="max-w-[50vw]"
              >
                <div
                  v-for="d in dr.children"
                  :key="d.options.id"
                  class="p-l-4 fr-py-2v rounded-lg"
                  :class="d.attrs?.class || ''"
                >
                  <div
                    class="flex no-flex-grow-for-checkboxes"
                    @click="onClickDemarches(d)"
                  >
                    <DsfrCheckbox
                      :key="dr.key"
                      label=""
                      class="fr-pr-2v"
                      :name="d.options.id.toString()"
                      :model-value="d.options.checked"
                      :disabled="d.attrs.disabled"
                      @update:model-value="checkOneDemarche({ id: d.options.id, checked: $event, d })"
                    />
                    <label
                      :title="d.options.title"
                      class="cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap"
                    >
                      {{ d.options.dsId }} - {{ d.options.title }}
                    </label>
                    <DemarcheLocalization
                      v-if="d.options.prefectureOptions"
                      class="fr-px-2v w-[20rem] overflow-auto flex-auto flex-grow"
                      :national="d.options.prefectureOptions.national.value"
                      :prefectures="d.options.prefectureOptions.prefectures.value"
                    />
                  </div>
                </div>
              </div>
            </fieldset>
          </template>
          <div
            v-else
            data-testid="noRoleSelectedMessage"
          >
            Vous devez d'abord sélectionner un rôle avant de pouvoir paramétrer les options.
          </div>
        </template>
      </div>
      <div class="fb-1/5 fr-p-4v flex-shrink-0">
        <div class="position-sticky top-2">
          <h5>
            Localisation
            <span
              v-if="!!(geographicalRights && geographicalRights.enabled)"
              class="fr-text--md"
            >
              :
              {{
                (demarcheOrTypeSelected as DemarchesRoles)?.label
                  || (demarcheOrTypeSelected as DemarcheRole)?.options?.title
                  || 'Toutes les démarches'
              }}
            </span>
          </h5>
          <div class="fr-pl-4v overflow-y-auto max-h-md">
            <UserGeographicalRights
              v-if="!!(geographicalRights && geographicalRights.enabled)"
              :key="keySelectUser"
              :geographical-rights="geographicalRights"
              @update:localization="updateNational($event)"
              @update:add-prefecture="addPrefecture($event)"
              @update:remove-prefecture="removePrefecture($event)"
            />
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="loading"
      class="absolute w-full h-full top-0 left-0 opacity-30 bg-dark flex justify-center"
    />
    <div
      v-if="loading"
      class="absolute w-full top-0 left-0 flex justify-center"
    >
      <div class="flex flex-col justify-center items-center">
        <VIcon
          class="mt-50"
          name="ri-refresh-line"
          color="white"
          scale="10"
          animation="spin"
        />
        <p class="text-white text-3xl">chargement en cours...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bn-sub-title {
  background-color: var(--background-alt-grey);
}

:deep(input[type='checkbox']:disabled + label) {
  color: var(--text-default-grey);
}

.flex-auto {
  flex-grow: 0 !important;
  flex-basis: auto !important;
}

.no-margin-bottom :deep(.fr-fieldset__element) {
  margin-bottom: 0 !important;
}

.no-flex-grow-for-checkboxes :deep(.fr-fieldset__element) {
  flex-grow: 0 !important;
  flex-basis: 3rem;
  flex-shrink: 0 !important;
}

.fb-1\/2 {
  flex-basis: 50%;
}
.fb-1\/5 {
  flex-basis: 20%;
}
</style>
