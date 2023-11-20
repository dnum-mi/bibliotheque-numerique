<script setup lang="ts">
import type { PrefectureKeys, PrefectureOptions } from '@biblio-num/shared'
import type { DsfrTagProps } from '@gouvminint/vue-dsfr/types/components/DsfrTag/DsfrTag.vue'
import { computed, ref } from 'vue'
import { LocalizationOptions, type LocalizationOptionsKeys } from './localization.enum'
import { listOfPrefectures } from '@/biblio-num/shared'

const props = defineProps<{
  geographicalRights: PrefectureOptions;
}>()

const emit = defineEmits<{
  'update:localization': [payload?: string];
  'update:removePrefecture': [payload?: string];
  'update:addPrefecture': [payload?: string];
}>()

const localizationOptions = computed(() => [
  {
    label: 'National',
    name: 'localization',
    value: LocalizationOptions.national,
    disabled: !props.geographicalRights.national.editable,
  },
  {
    label: 'Préfecture(s)',
    name: 'localization',
    value: LocalizationOptions.prefectures,
    disabled: !props.geographicalRights.national.editable && props.geographicalRights.national.value,
  },
])

const localizationOption = computed<LocalizationOptionsKeys | undefined>(() => {
  return props.geographicalRights.national.value ? localizationOptions.value[0].value : localizationOptions.value[1].value
})
const disabledAddPrefectures = computed<boolean>(() => {
  return props.geographicalRights.national.value
})
// const localizationSelected = ref<string | undefined>(localizationOption.value)

const isDeletable = (option: PrefectureOptions, prefecture: PrefectureKeys): boolean =>
  option.national.editable || option.prefectures?.deletable.includes(prefecture)

const prefectures = computed<DsfrTagProps[]>(() =>
  [
    props.geographicalRights.prefectures?.value.map<DsfrTagProps>((value) =>
      isDeletable(props.geographicalRights, value)
        ? {
            label: value.substring(1),
            tagName: 'button',
            class: 'fr-tag--dismiss',
            onClick: () => {
              removePrefecture(value)
            },
          }
        : {
            label: value.substring(1),
          },
    ),
  ].flat(),
)

const possiblePrefectures = computed<PrefectureKeys[]>(() =>
  props.geographicalRights.national.editable ? listOfPrefectures : props.geographicalRights.prefectures?.addable,
)

const prefecturesToAdd = computed<DsfrTagProps[]>(() =>
  possiblePrefectures.value
    .filter((pref) => !props.geographicalRights.prefectures.value.includes(pref))
    .map<DsfrTagProps>((pref) => ({
      class: disabledAddPrefectures.value ? '' : 'tag-button',
      label: pref.substring(1),
      tagName: 'button',
      onClick: () => {
        addPrefecture(pref)
      },
      disabled: disabledAddPrefectures.value,
    })),
)

const updateCheckedLocalization = (loc: LocalizationOptionsKeys) => {
  emit('update:localization', loc)
}

const removePrefecture = (pref: string) => {
  // TODO: call  to remove prefecture
  emit('update:removePrefecture', pref)
}

const addPrefecture = (pref: string) => {
  emit('update:addPrefecture', pref)
}

const newPrefecture = ref<string>('')
</script>

<template>
  <DsfrRadioButton
    v-for="option in localizationOptions"
    :key="option.value"
    class="p-b-2"
    :label="option.label"
    :name="option.name"
    :value="option.value"
    :model-value="localizationOption"
    :disabled="option.disabled"
    @update:model-value="updateCheckedLocalization(option.value as string)"
  />
  <div>
    <DsfrTags :tags="prefectures" />

    <fieldset v-if="prefecturesToAdd?.length">
      <legend>Préfectures disponibles</legend>
      <DsfrTags :tags="prefecturesToAdd" />
    </fieldset>
  </div>
</template>

<style scope>
.tag-button {
  background-color: var(--background-action-high-blue-france) !important;
  color: var(--text-inverted-grey) !important;
}

.tag-button:hover {
  background-color: var(--background-action-high-blue-france-hover) !important;
}

.tag-button:active {
  background-color: var(--background-action-high-blue-france-active) !important;
}
</style>
