<script setup lang="ts">
import type { PrefectureOptions } from '@biblio-num/shared'
import type { DsfrTagProps } from '@gouvminint/vue-dsfr/types/components/DsfrTag/DsfrTag.vue'
import { computed, ref } from 'vue'

const props = defineProps<{
  geographicalRights: PrefectureOptions
}>()

const emit = defineEmits<{
  'update:localization': [payload?: string],
}>()

const localizationOptions = computed(() => [
  {
    label: 'National',
    name: 'localization',
    value: 'national',
    disabled: !props.geographicalRights.national.editable,
  },
  {
    label: 'Préfecture(s)',
    name: 'localization',
    value: 'prefectures',
    disabled: (!props.geographicalRights.national.editable && props.geographicalRights.national.value),
  },
])

const localizationOption = computed<string | undefined>(
  () => {
    return props.geographicalRights.national.value
      ? localizationOptions.value[0].value
      : localizationOptions.value[1].value
  },
)
const localizationSelected = ref<string | undefined>(localizationOption.value)

const prefectures = computed<DsfrTagProps[]>(() => [
  props.geographicalRights.prefectures?.value.map<DsfrTagProps>(
    (value) => props.geographicalRights.prefectures.deletable.includes(value)
      ? ({
          label: value,
          tagName: 'button',
          class: 'fr-tag--dismiss',
          onClick: () => {
            removePrefecture(value)
          },
        })
      : ({
          label: value,
        }),
  ),
].flat())

const prefecturesToAdd = computed<DsfrTagProps[]>(
  () => props.geographicalRights.prefectures?.addable
    .filter((pref) => !props.geographicalRights.prefectures.value.includes(pref))
    .map<DsfrTagProps>(
      (pref) => ({
        class: 'tag-button',
        label: pref,
        tagName: 'button',
        onClick: () => {
          addPrefecture(pref)
        },
      }),
    ),
)

const updateCheckedLocalization = (loc: string) => {
  // TODO: emit localization change action nation or prefecture
  emit('update:localization', loc)
}

const removePrefecture = (pref: string) => {
  // TODO: call  to remove prefecture
  console.log(pref)
}

const addPrefecture = (pref: string) => {
  console.log(pref)
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
    :model-value="localizationSelected"
    :disabled="option.disabled"
    @update:model-value="updateCheckedLocalization(option.value as string)"
  />
  <div>
    <DsfrTags
      :tags="prefectures"
    />

    <fieldset
      v-if="prefecturesToAdd?.length"
    >
      <legend>
        Préfectures disponibles
      </legend>
      <DsfrTags
        :tags="prefecturesToAdd"
      />
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
