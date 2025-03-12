<script lang="ts" setup>
import type {
  OneDemarcheRoleOption,
  OnePrefectureUpdateDto,
  PrefectureOptions,
  UserOutputDto,
  UserWithEditableRole,
  OrganismeTypeKey,
} from '@biblio-num/shared'

import {
  eOrganismeType,
} from '@biblio-num/shared'

import { useUserStore } from '@/stores'
import { getRandomId } from '@gouvminint/vue-dsfr'
import { computed, ref } from 'vue'
import DemarcheLocalization from './DemarcheLocalization.vue'

import UserGeographicalRights from './UserGeographicalRights.vue'
import { LocalizationOptions } from './localization.enum'
import type { LocalizationOptionsKeys } from './localization.enum'

import UserRole from './UserRole.vue'

const props = defineProps<{ selectedEditableUser: UserWithEditableRole }>()

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
  localization?: PrefectureOptions
  commonPrefectureValues: string[]
  commonPrefectureAddables: string[]
  commonPrefectureDeletables: string[]
  children?: DemarcheRole[]
  attrs: DemarcheHtmlAttrs
}
type GeographicalRights = PrefectureOptions & { disabled?: boolean }

const typeOrganismeLabel: Record<OrganismeTypeKey, string> = {
  [eOrganismeType.ARUP]: 'Associations reconnues d’utilité publique (ARUP)',
  [eOrganismeType.CULTE]: 'Associations cultuelles (Cultes)',
  [eOrganismeType.FDD]: 'Fonds de dotation (FDD)',
  [eOrganismeType.FE]: 'Fondations d’entreprises (FE)',
  [eOrganismeType.FRUP]: 'Fondations reconnues d’utilité publique (FRUP)',
  [eOrganismeType.unknown]: 'Type d’organisme inconnu',
}
//#endregion
let noRefDemarcheOrTypeSelected: DemarchesRoles | DemarcheRole
const userStore = useUserStore()
const selectedUser = computed<UserOutputDto>(() => props.selectedEditableUser.originalUser)
const demarcheHash = computed<Record<number, OneDemarcheRoleOption>>(() => props.selectedEditableUser.demarcheHash)
const keySelectUser = computed<string>(() => userStore.keySelectUser)
const loading = computed<boolean>(() => userStore.selectedEditableUserLoading)
//#region View Demarches
const isAllCheck = (children: DemarcheRole[]): boolean =>
  children.reduce((val, demarche) => {
    return (val &&= demarche.options.checked)
  }, true)

const getCommonPrefectureOptionGetter = (children: DemarcheRole[]) => (prop: 'addable' | 'value' | 'deletable') => {
  const commonPrefectureAddables: string[] = []
  const childrenOptions = children.map(
    ({
      options: {
        prefectureOptions: { prefectures },
      },
    }) => ({ [prop]: prefectures[prop] }),
  )

  const firstChildOption = childrenOptions.shift() || { [prop]: [] }
  if (childrenOptions.length === 0) {
    // S’il n’y avait qu’un seul type de démarche...
    commonPrefectureAddables.push(...firstChildOption[prop]) // ... on ajoute les préfectures de ce type
  } else {
    for (const childOptions of childrenOptions) {
      if (childOptions[prop].length !== firstChildOption[prop].length) {
        break
      }
      let continueLoop = true
      for (const pref of childOptions[prop]) {
        if (!firstChildOption[prop].includes(pref)) {
          continueLoop = false
          break
        }
      }
      if (!continueLoop) {
        break
      }
      commonPrefectureAddables.push(...childOptions[prop])
    }
  }
  return [...new Set(commonPrefectureAddables)]
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
      const localization: PrefectureOptions = {
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
        key: getRandomId(type),
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
  await userStore.updateUserRolesOption(dr.children?.map((child) => {
    child.options.checked = checked
    deduceCheckTypeFromChild(child.options.id)
    return {
      demarcheId: child.options.id,
      checked,
    }
  }), false)

  dr.key = getRandomId(name)
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

const demarcheOrTypeSelected = ref<DemarchesRoles | DemarcheRole | null>(null)

const onClickDemarches = (elt: DemarchesRoles | DemarcheRole) => {
  if (elt.attrs.disabled) {
    return
  }

  demarchesRoles.value.forEach((dr) => {
    dr.attrs.class = null
    dr.children?.forEach((d) => {
      d.attrs.class = null
    })
  })

  elt.attrs.class = 'fr-background-contrast--info'
  demarcheOrTypeSelected.value = elt
  noRefDemarcheOrTypeSelected = elt
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
      disabled: demarcheHash.value[id].checked,
    }
  }

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
    disabled: drSelected?.value,
  } as GeographicalRights
})

const _updateGeographicalRight = async (optionLoc: { national?: boolean; prefecture?: OnePrefectureUpdateDto }) => {
  if (!demarcheOrTypeSelected.value) {
    return null
  }

  const demarcheSelected: DemarcheRole | null = 'options' in demarcheOrTypeSelected.value ? demarcheOrTypeSelected.value : null
  const typeSelected: DemarchesRoles | null = 'options' in demarcheOrTypeSelected.value ? null : demarcheOrTypeSelected.value

  if (demarcheSelected) {
    await userStore.updateUserOneRoleOption(
      {
        demarcheId: demarcheSelected.options.id,
        ...optionLoc,
      },
      true,
    )
  } else if (typeSelected) {
    await Promise.all(
      (typeSelected.children ?? []).map((child) =>
        userStore.updateUserOneRoleOption(
          {
            demarcheId: child.options.id,
            ...optionLoc,
          },
          false,
        ),
      ),
    )
    await userStore.loadUserById(selectedUser.value?.id)
  }
}

const updatePrefecture = (option: OnePrefectureUpdateDto) => _updateGeographicalRight({ prefecture: option })

const updateNational = (loc: LocalizationOptionsKeys) => _updateGeographicalRight({ national: loc === LocalizationOptions.national })

const addPrefecture = (prefecture: string) => {
  return updatePrefecture({
    key: prefecture,
    toAdd: true,
  })
}

const removePrefecture = (prefecture: string) => {
  return updatePrefecture({
    key: prefecture,
    toAdd: false,
  })
}

//#endregion
</script>

<template>
  <div
    :key="keySelectUser"
    class="flex flex-row gap-4 fr-p-2w flex-wrap bn-sub-title"
  >
    <div>
      <label class="bn-fiche-sub-title--label">Courriel</label>
      <span class="text-xl">{{ selectedUser.email }}</span>
    </div>
    <div v-if="!!selectedUser?.firstname || !!selectedUser?.lastname">
      <label class="bn-fiche-sub-title--label">Nom complet</label>
      <span class="text-xl">{{ selectedUser.firstname || "" }} {{ selectedUser.lastname || "" }}</span>
    </div>
    <div v-if="!!selectedUser?.job">
      <label class="bn-fiche-sub-title--label">fonction</label>
      <span class="text-xl">{{ selectedUser.job }}</span>
    </div>
  </div>

  <div class="fr-container relative">
    <div
      class="flex flex-row gap-10"
      :class="{ 'blur-2': loading }"
    >
      <div class="w-1/4 fr-p-4v">
        <h5>Rôle</h5>
        <div class="fr-pl-4v">
          <UserRole />
        </div>
      </div>
      <div class="w-1/2 fr-p-4v">
        <h5>Démarches</h5>
        <template v-if="selectedEditableUser?.originalUser.role.label">
          <div
            v-for="dr in demarchesRoles"
            :key="dr.name"
          >
            <div
              class="flex flex-row justify-between fr-py-2w rounded-lg"
              :class="dr.attrs?.class"
              @click="onClickDemarches(dr)"
            >
              <DsfrCheckbox
                class="font-bold fr-px-2v  flex-auto"
                label=""
                :name="dr.name"
                :model-value="dr.value"
                :disabled="dr.attrs.disabled"
                @update:model-value="checkAllTypeChildren({ name: dr.name, checked: $event, dr })"
              />
              <label class="flex-shrink-0 flex-grow cursor-pointer fr-text--bold">
                {{ dr.label }}
              </label>
              <div class="fr-px-2v">
                <DemarcheLocalization
                  v-if="dr.localization || dr.commonPrefectureValues"
                  :key="dr.key"
                  :national="dr.localization?.national.value"
                  :prefectures="dr.commonPrefectureValues"
                />
              </div>
            </div>
            <div v-if="dr.children">
              <div
                v-for="d in dr.children"
                :key="d.options.id"
                class="p-l-4 fr-py-2v rounded-lg"
                :class="d.attrs?.class || ''"
              >
                <div
                  class="flex flex-row justify-between py-2"
                  @click="onClickDemarches(d)"
                >
                  <DsfrCheckbox
                    :key="dr.key"
                    label=""
                    class="fr-px-2v  flex-auto"
                    :name="d.options.id.toString()"
                    :model-value="d.options.checked"
                    :disabled="d.attrs.disabled"
                    @update:model-value="checkOneDemarche({ id: d.options.id, checked: $event, d })"
                  />
                  <label class="flex-shrink-0 flex-grow cursor-pointer">
                    {{ d.options.title }}
                  </label>
                  <div class="fr-px-2v">
                    <DemarcheLocalization
                      v-if="d.options.prefectureOptions"
                      :national="d.options.prefectureOptions.national.value"
                      :prefectures="d.options.prefectureOptions.prefectures.value"
                    />
                  </div>
                </div>
              </div>
            </div>
            <hr class="fr-hr fr-mt-2w">
          </div>
        </template>
        <div
          v-else
          data-testid="noRoleSelectedMessage"
        >
          Vous devez d'abord sélectionner un rôle avant de pouvoir paramétrer les options.
        </div>
      </div>
      <div class="w-1/4 fr-p-4v">
        <h5>Localisation</h5>
        <div class="fr-pl-4v">
          <UserGeographicalRights
            v-if="!!(geographicalRights && geographicalRights.disabled)"
            :key="keySelectUser"
            :geographical-rights="geographicalRights"
            @update:localization="updateNational($event)"
            @update:add-prefecture="addPrefecture($event)"
            @update:remove-prefecture="removePrefecture($event)"
          />
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
        <p class="text-white text-3xl">
          chargement en cours...
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bn-sub-title {
  background-color: var(--background-alt-grey);
}

:deep(input[type="checkbox"]:disabled + label) {
  color: var(--text-default-grey);
}

.flex-auto {
  flex-grow: 0 !important;
  flex-basis: auto !important;
}
</style>
