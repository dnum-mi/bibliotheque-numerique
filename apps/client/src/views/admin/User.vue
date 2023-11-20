<script lang="ts" setup>
import type {
  OrganismeTypeKeys,
  PrefectureOptions,
  UserOutputDto,
  UserWithEditableRole,
  OneDemarcheRoleOption,
  PrefectureKeys,
} from '@biblio-num/shared'
import { onMounted, ref, computed } from 'vue'
import { useUserStore } from '@/stores'
import { useRoute } from 'vue-router'
import { OrganismeType, Roles } from '@/biblio-num/shared'
import DemarcheLocalization from './DemarcheLocalization.vue'
import { getRandomId } from '@gouvminint/vue-dsfr'

import UserGeographicalRights from './UserGeographicalRights.vue'
import { LocalizationOptions, type LocalizationOptionsKeys } from './localization.enum'

import UserRole from './UserRole.vue'
// #region Types, Mapping, Enum
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
  name: OrganismeTypeKeys
  value: boolean
  key: string
  localization?: PrefectureOptions
  commonPrefectureValues: string[]
  commonPrefectureAddables: string[]
  commonPrefectureDeletables: string[]
  children?: DemarcheRole[]
  attrs: DemarcheHtmlAttrs
}

const typeOrganismeLabel: Record<OrganismeTypeKeys, string> = {
  [OrganismeType.ARUP]: 'Associations reconnues d’utilité publique (ARUP)',
  [OrganismeType.CULTE]: 'Associations cultuelles (Cultes)',
  [OrganismeType.FDD]: 'Fonds de dotation (FDD)',
  [OrganismeType.FE]: 'Fondations d’entreprises (FE)',
  [OrganismeType.FRUP]: 'Fondations reconnues d’utilité publique (FRUP)',
  [OrganismeType.unknown]: 'Type d’organisme inconnu',
}
// #endregion

const userStore = useUserStore()
const selectedUser = computed<UserWithEditableRole | null>(() => userStore.selectedUser)
const user = computed<UserOutputDto|undefined>(() => selectedUser.value?.originalUser)
const demarcheHash = computed<Record<number, OneDemarcheRoleOption>| undefined>(() => selectedUser.value?.demarcheHash)
const keySelectUser = computed<string>(() => userStore.keySelectUser)
// #region View Demarches
const isAllCheck = (children: DemarcheRole[]):boolean => children.reduce((val, demarche) => {
  return (val &&= demarche.options.checked)
}, true)

const getCommonPrefectureOptionGetter = (children: DemarcheRole[]) => (prop: 'addable' | 'value' | 'deletable') => {
  const commonPrefectureAddables: string[] = []
  const childrenOptions = children
    .map(({ options: { prefectureOptions: { prefectures } } }) => ({ [prop]: prefectures[prop] }))

  const firstChildOption = childrenOptions.shift() || { [prop]: [] }
  if (childrenOptions.length === 0) { // S’il n’y avait qu’un seul type de démarche...
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
  return commonPrefectureAddables
}

const organismeTypes = computed(() => [
  ...new Set(Object.values(demarcheHash.value || {}).map(({ types }) => types.length ? types : [OrganismeType.unknown]).flat()),
])

const demarchesRoles = computed<DemarchesRoles[]>(() => {
  if (!demarcheHash.value) return []

  return organismeTypes.value.map((type) => {
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
          .filter(demarcheOption => demarcheOption.types.length === 0)
          .map(dOpts => ({ ...dOpts, types: [OrganismeType.unknown] })),
      )
      .filter(demarcheOption => demarcheOption.types.includes(type))
      .map((d): DemarcheRole => {
        localization.national.value &&= d.prefectureOptions.national.value
        localization.national.editable &&= d.prefectureOptions.national.editable

        let newClass: string |null | undefined = null
        if ((noRefdemarcheOrTypeSelected as DemarcheRole)?.options?.id === d.id) {
          newClass = noRefdemarcheOrTypeSelected?.attrs.class
        }

        return {
          options: d,
          attrs: {
            class: newClass ?? null,
            disabled: !canEditDemarche(d),
          },
        }
      })
    const value = isAllCheck(children)

    const getCommonPrefectureOptionsFor = getCommonPrefectureOptionGetter(children)

    const commonPrefectureValues: string[] = getCommonPrefectureOptionsFor('value')
    const commonPrefectureAddables: string[] = getCommonPrefectureOptionsFor('addable')
    const commonPrefectureDeletables: string[] = getCommonPrefectureOptionsFor('deletable')

    let newClass: string |null | undefined = null
    if ((noRefdemarcheOrTypeSelected as DemarchesRoles)?.name === type) {
      newClass = noRefdemarcheOrTypeSelected?.attrs.class
    }

    return {
      label: typeOrganismeLabel[type] || typeOrganismeLabel[OrganismeType.unknown],
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
        disabled: children?.some(d => !canEditDemarche(d.options)),
      },
    }
  })
    .filter(type => type.children && type.children.length)
})

const updateCheckTypeByChild = (id: number) => {
  if (!demarcheHash.value || !demarcheHash.value[id]?.types) return
  demarcheHash.value[id].types.forEach((type: string) => {
    const objType = demarchesRoles.value.filter(dr => dr.name === type)[0]
    if (!objType || !objType.children) return
    objType.value = isAllCheck(objType.children)
  })
}

const updateTypeDemarche = async ({ name, checked, dr }: { name: string, checked: boolean, dr:DemarchesRoles}) => {
  dr.value = checked
  if (!checked || !dr.children) return
  await Promise.all(dr.children?.map(
    child => updateDemarche({ name, id: child.options.id, checked, d: child, reloadUser: false }),
  ))
  dr.key = getRandomId(name)
  if (user.value?.id) {
    await userStore.loadUserById(user.value?.id)
  }
}

const updateDemarche = async ({ name, id, checked, d, reloadUser = true }: { name: string, id: number, checked: boolean, d:DemarcheRole, reloadUser?: boolean }) => {
  d.options.checked = checked
  updateCheckTypeByChild(id)
  await userStore.updateUserDemarchesRole({
    demarcheId: d.options.id,
    checked,
  }, reloadUser)
}

const demarcheOrTypeSelected = ref< DemarchesRoles | DemarcheRole | null>(null)
let noRefdemarcheOrTypeSelected: DemarchesRoles | DemarcheRole

const onClickDemarches = (elt: DemarchesRoles | DemarcheRole) => {
  if (elt.attrs.disabled) {
    return
  }

  demarchesRoles.value.forEach((dr) => {
    dr.attrs.class = null
    dr.children?.forEach(d => { d.attrs.class = null })
  })

  elt.attrs.class = 'fr-background-contrast--info'
  demarcheOrTypeSelected.value = elt
  noRefdemarcheOrTypeSelected = elt
}

const canEditDemarche = (d: OneDemarcheRoleOption) => d.editable

// #endregion

// #region view localization
const keyLocalization = ref<string>(getRandomId('location'))

type GeographicalRights = PrefectureOptions & { disabled?: boolean }
const geographicalRights = computed<GeographicalRights | null>(
  () => {
    if (!demarcheOrTypeSelected.value) return null
    if ('options' in demarcheOrTypeSelected.value) {
      const id:number = demarcheOrTypeSelected.value.options.id
      if (!demarcheHash.value) return null
      return ({
        ...demarcheHash.value[id].prefectureOptions,
        disabled: demarcheHash.value[id].checked,
      })
    }

    const drSelected = demarchesRoles.value.find(dr => dr.name === (demarcheOrTypeSelected.value as DemarchesRoles).name)
    return ({
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
    })
  })

const udpateLocalizationFn = async (optionLoc: { national: boolean} | {
    prefecture: {
        key: PrefectureKeys,
        toAdd: boolean,
      }
    },
) => {
  if (!demarcheOrTypeSelected.value) return null

  if ('options' in demarcheOrTypeSelected.value) {
    await userStore.updateUserDemarchesRole({
      demarcheId: demarcheOrTypeSelected.value.options.id,
      ...optionLoc,
    }, true)

    return
  }

  await (demarcheOrTypeSelected.value as DemarchesRoles).children?.map((child) =>
    userStore.updateUserDemarchesRole({
      demarcheId: child.options.id,
      ...optionLoc,
    }, false),
  )
  if (user.value?.id) {
    await userStore.loadUserById(user.value?.id)
  }
}

const udpateLocalization = (loc: LocalizationOptionsKeys) => {
  // TODO: Message d'erreur a mettre
  return udpateLocalizationFn({ national: loc === LocalizationOptions.national })
}

const addPrefecture = (prefecture: string) => {
  return udpateLocalizationFn({
    prefecture: {
      key: prefecture,
      toAdd: true,
    },
  })
}

const removePrefecture = (prefecture: string) => {
  return udpateLocalizationFn({
    prefecture: {
      key: prefecture,
      toAdd: false,
    },
  })
}

// #endregion

onMounted(async () => {
  const params = useRoute()?.params
  const id = Number(params.id)
  if (id) {
    await userStore.loadUserById(id)
  }
})
</script>

<template>
  <div
    :key="keySelectUser"
    class="flex flex-row  gap-4 fr-p-2w flex-wrap bn-sub-title"
  >
    <div>
      <label class="bn-fiche-sub-title--label">Courriel</label>
      <span class="text-xl">{{ user?.email }}</span>
    </div>
    <div
      v-if="!!user?.firstname || !!user?.lastname"
    >
      <label class="bn-fiche-sub-title--label">Nom complet</label>
      <span class="text-xl">{{ user?.firstname || '' }} {{ user?.lastname || '' }}</span>
    </div>
    <div
      v-if="!!user?.job"
    >
      <label class="bn-fiche-sub-title--label">fonction</label>
      <span class="text-xl">{{ user?.job }}</span>
    </div>
  </div>

  <div
    class="fr-container"
  >
    <div class="flex flex-row gap-10">
      <div class="w-1/4 fr-p-4v">
        <h5>
          Rôle
        </h5>
        <div class="fr-pl-4v">
          <UserRole />
        </div>
      </div>
      <div class="w-1/2 fr-p-4v">
        <h5>
          Démarches
        </h5>
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
              class="font-bold fr-px-2v"
              :label="dr.label"
              :name="dr.name"
              :model-value="dr.value"
              :disabled="dr.attrs.disabled"
              @update:model-value="updateTypeDemarche({ name: dr.name, checked: $event, dr})"
            />
            <DemarcheLocalization
              v-if="dr.localization || dr.commonPrefectureValues"
              :key="dr.key"
              class="fr-px-2v"
              :national="dr.localization?.national.value"
              :prefectures="dr.commonPrefectureValues"
            />
          </div>
          <div v-if="dr.children">
            <div
              v-for="d in dr.children"
              :key="d.options.id"
              class="p-l-4 fr-py-2v rounded-lg"
              :class="d.attrs?.class || ''"
            >
              <div
                class="flex  flex-row  justify-between  py-2"
                @click="onClickDemarches(d)"
              >
                <DsfrCheckbox
                  :key="dr.key"
                  :label="d.options.title"
                  class="fr-px-2v"
                  :name="d.options.id.toString()"
                  :model-value="d.options.checked"
                  :disabled="d.attrs.disabled"
                  @update:model-value="updateDemarche({ name: dr.name, id: d.options.id,checked: $event, d })"
                />
                <DemarcheLocalization
                  v-if="d.options.prefectureOptions"
                  class="fr-px-2v"
                  :national="d.options.prefectureOptions.national.value"
                  :prefectures="d.options.prefectureOptions.prefectures.value"
                />
              </div>
            </div>
          </div>
          <hr class="fr-hr fr-mt-2w">
        </div>
      </div>
      <div class="w-1/4 fr-p-4v">
        <h5>
          Localisation
        </h5>
        <div class="fr-pl-4v">
          <UserGeographicalRights
            v-if="!!(geographicalRights && geographicalRights.disabled)"
            :key="keySelectUser"
            :geographical-rights="geographicalRights"
            @update:localization="udpateLocalization($event)"
            @update:add-prefecture="addPrefecture($event)"
            @update:remove-prefecture="removePrefecture($event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bn-sub-title {
  background-color: var(--background-alt-grey);
}

:deep(input[type="checkbox"]:disabled + label) {
  color: var(--text-grey);
}
</style>
