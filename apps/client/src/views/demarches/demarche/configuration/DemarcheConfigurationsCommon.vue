<script lang="ts" setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useDebounceFn, useLocalStorage } from '@vueuse/core'

import { FieldSource } from '@biblio-num/shared'
import type { IMappingColumn } from '@biblio-num/shared'

import DemarcheConfigurationSelectableItem from './DemarcheConfigurationSelectableItem.vue'
import DemarcheConfigurationSelectedItem from './DemarcheConfigurationSelectedItem.vue'

interface IMeta {
  id: string,
  label: string,
}
type IData = Record<string, {
  id: string,
  label: string,
  children?: IMappingColumn[]
}>

interface IMappingColumnConfPart {
  meta: IMeta,
  data: IData
}

export interface IConfParts {
  [FieldSource.champs]: IMappingColumnConfPart,
  [FieldSource.annotation]: IMappingColumnConfPart,
  [FieldSource.fixField]?: IMappingColumnConfPart
}

const props = withDefaults(defineProps<{
  currentDemarcheConfiguration: IMappingColumn[]
  isSelectedFn: (ch: IMappingColumn) => boolean
  canChangeLabel?: boolean,
  demarcheTitle?: string,
  selectedTitle?: string,
}>(), {
  canChangeLabel: true,
  demarcheTitle: 'Champs Démarche Simplifiée',
  selectedTitle: 'Champs sélectionnés pour l’affichage des colonnes',
})

const emit = defineEmits<{
  'save-one': [{ id: string, label: string | null }]
}>()

const demarcheConfiguration = computed<IMappingColumn[]>(() => props.currentDemarcheConfiguration)

const getDefaultConfParts = (): IConfParts => ({
  [FieldSource.champs]: {
    meta: {
      id: 'champs',
      label: props.demarcheTitle,
    },
    data: {} as Record<string, {
      id: string
      label: string
      children?: IMappingColumn[]
    }>,
  },
  [FieldSource.annotation]: {
    meta: {
      id: 'annotation',
      label: 'Annotations privées',
    },
    data: {} as Record<string, {
      id: string
      label: string
      children?: IMappingColumn[]
    }>,
  },
  [FieldSource.fixField]: {
    meta: {
      id: 'fix-field',
      label: 'Données BN',
    },
    data: {} as Record<string, {
      id: string
      label: string
      children?: IMappingColumn[]
    }>,
  },
})

const confParts = ref<IConfParts>(getDefaultConfParts())
const idNoSection = 'no-section'
const updateDataGroup = () => {
  confParts.value = Object.fromEntries(
    Object.entries(getDefaultConfParts()).map(([key, confPartDefault]) => {
      if (!confPartDefault) {
        return [key, undefined]
      }
      let groupId = idNoSection

      const data = demarcheConfiguration.value.filter(mappingColumn => mappingColumn.source === key).reduce((acc, mappingColumn) => {
        groupId = mappingColumn.isHeader ? mappingColumn.id : groupId
        if (!acc[groupId]) {
          acc[groupId] = {
            id: groupId,
            label: mappingColumn.isHeader ? (mappingColumn.columnLabel || mappingColumn.originalLabel) : 'Sans en-tête',
            children: [],
          }
        }

        if (!mappingColumn.isHeader) {
          acc[groupId]?.children?.push(mappingColumn)
        }
        return acc
      }, confPartDefault.data)

      return [key, { ...confPartDefault, data }]
    }),
  )

  const fixFieldPart = confParts.value[FieldSource.fixField]?.data
  if (!!fixFieldPart
    && Object.values(fixFieldPart).some(group => group.children?.length === 0)) {
    delete confParts.value[FieldSource.fixField]
  }
}

onMounted(() => {
  updateDataGroup()
})
watch(demarcheConfiguration, () => {
  updateDataGroup()
})

const selectedPartId = useLocalStorage('dem-conf-ds-part', Object.keys(confParts.value)[0])

const buttons = computed(() => Object.entries(confParts.value).map(([_, { meta: { label, id } }]) => ({
  label,
  value: id,
  secondary: id !== selectedPartId.value,
})))

const cdsExpandedId = ref<string | undefined>('cds-1')

const saveOneMappingColumn = async (id: string, label: string | null) => {
  emit('save-one', { id, label })
}
const saveOneMappingColumnDebounced = useDebounceFn(saveOneMappingColumn, 300)
</script>

<template>
  <div class="flex fr-pl-2w">
    <div class="flex-basis-[50%]  flex-shrink-0  pt-6  pr-8  border-r-2  border-r-[var(--grey-925-125)]  border-r-solid">
      <header>
        <h4>
          Champs à sélectionner
        </h4>
        <div
          class="flex  mb-4  w-[100%]  no-wrap  min-w-[400px]"
          role="tablist"
        >
          <DsfrButton
            v-for="button in buttons"
            :key="button.value"
            role="tab"
            class="button-text-xs  flex-grow  justify-center"
            v-bind="button"
            :aria-controls="`content-${button.value}`"
            @click="selectedPartId = button.value"
          />
        </div>
      </header>

      <section
        v-for="([key, confPartValue]) of Object.entries(confParts)"
        :id="`content-${key}`"
        :key="key"
        tabindex="0"
        class="tabpane"
        :class="{ active: selectedPartId === key }"
        role="tabpanel"
        :aria-selected="selectedPartId === key"
        aria-labelledby="tab-champs"
      >
        <h5>{{ confPartValue?.meta.label || '' }}</h5>
        <template
          v-for="([keySection, section]) of confPartValue ? Object.entries(confPartValue.data) : []"
          :key="keySection"
        >
          <component
            :is="section.id !== idNoSection ? 'DsfrAccordion' : 'div'"
            :expanded-id="cdsExpandedId"
            :title="section.label"
            @expand="cdsExpandedId = $event"
          >
            <ul class="list-none">
              <li
                v-for="champ of section.children"
                :key="champ.id"
                class="flex  items-center  justify-between  p-2"
              >
                <template v-if="champ.children?.length">
                  <div>
                    <h6 class="fr-text--md">
                      {{ champ.originalLabel }}
                    </h6>
                    <ul class="list-none">
                      <li
                        v-for="child of champ.children"
                        :key="child.id"
                        class="flex  items-center  justify-between  p-2"
                      >
                        <DemarcheConfigurationSelectableItem
                          :champ="child"
                          :is-selected-fn="isSelectedFn"
                          @toggle-check="saveOneMappingColumn(child.id, $event ? child.originalLabel : null)"
                        />
                      </li>
                    </ul>
                  </div>
                </template>
                <template v-else>
                  <DemarcheConfigurationSelectableItem
                    :champ="champ"
                    :is-selected-fn="isSelectedFn"
                    @toggle-check="saveOneMappingColumn(champ.id, $event ? champ.originalLabel : null)"
                  />
                </template>
              </li>
            </ul>
          </component>
        </template>
      </section>
    </div>
    <div class="flex-basis-[50%]  p-t-6  bg-[var(--grey-975-75)]">
      <h4 class="fr-container">
        {{ selectedTitle }}
      </h4>
      <hr>
      <div class="fr-container">
        <div
          v-for="([key, group]) of Object.entries(confParts)"
          :key="key"
          class="fr-mb-4w"
        >
          <h5 class="fr-ml-2w  fr-mb-1v  text-[var(--blue-france-sun-113-625)]  fr-text--md">
            {{ group.meta.label }}
          </h5>
          <template
            v-if="Array.isArray(group.data)"
          >
            <VIcon
              v-if="!group.data?.some(champ => isSelectedFn(champ) || (champ.children?.length && champ.children.some(chp => isSelectedFn(champ))))"
              class="fr-ml-6w  fr-mt-1w"
              name="ri-subtract-line"
              label="Aucun champ sélectionné dans cette partie"
            />

            <template
              v-for="champ of group.data"
              :key="champ.id"
            >
              <div
                v-if="isSelectedFn(champ) || (champ.children?.length && champ.children.some(chp => isSelectedFn(chp)))"
                class="fr-pl-6w  fr-my-2w  flex  justify-between  items-center"
              >
                <div v-if="champ.children?.length">
                  <h6 class="fr-text--md">
                    {{ champ.originalLabel }}
                  </h6>

                  <template
                    v-for="childChamp of champ.children"
                    :key="childChamp.id"
                  >
                    <DemarcheConfigurationSelectedItem
                      v-if="isSelectedFn(childChamp)"
                      class="fr-my-2w  fr-ml-2w"
                      :champ="childChamp"
                      :can-change-label="canChangeLabel"
                      @remove="saveOneMappingColumn(childChamp.id, null)"
                      @update:model-value="saveOneMappingColumnDebounced(childChamp.id, $event)"
                    />
                  </template>
                </div>
                <DemarcheConfigurationSelectedItem
                  v-else
                  :champ="champ"
                  :can-change-label="canChangeLabel"
                  @remove="saveOneMappingColumn(champ.id, null)"
                  @update:model-value="saveOneMappingColumnDebounced(champ.id, $event)"
                />
              </div>
            </template>
          </template>
          <template v-else>
            <div
              v-for="(child, childKey) in group.data"
              :key="childKey"
            >
              <h6 class="fr-ml-4w  fr-mt-2w  fr-mb-0  text-[var(--blue-france-sun-113-625)]  fr-text--md  font-400">
                {{ child.label }}
              </h6>

              <VIcon
                v-if="!child.children?.some(champ => champ.columnLabel || (champ.children?.length && champ.children.some(chp => chp.columnLabel)))"
                class="fr-ml-6w  fr-mt-1w"
                name="ri-subtract-line"
                label="Aucun champ sélectionné dans cette partie"
              />

              <template
                v-for="champ of child.children"
                :key="champ.id"
              >
                <div
                  v-if="isSelectedFn(champ) || (champ.children?.length && champ.children.some(chp => isSelectedFn(chp)))"
                  class="fr-pl-6w  fr-my-2w  flex  justify-between  items-center"
                >
                  <div v-if="champ.children?.length">
                    <h6 class="fr-text--md">
                      {{ champ.originalLabel }}
                    </h6>
                    <template
                      v-for="childChamp of champ.children"
                      :key="childChamp.id"
                    >
                      <DemarcheConfigurationSelectedItem
                        v-if="isSelectedFn(childChamp)"
                        class="fr-my-2w  fr-ml-2w"
                        :champ="childChamp"
                        :can-change-label="canChangeLabel"
                        @remove="saveOneMappingColumn(childChamp.id, null)"
                        @update:model-value="saveOneMappingColumnDebounced(childChamp.id, $event)"
                      />
                    </template>
                  </div>
                  <DemarcheConfigurationSelectedItem
                    v-else
                    :champ="champ"
                    :can-change-label="canChangeLabel"
                    @remove="saveOneMappingColumn(champ.id, null)"
                    @update:model-value="saveOneMappingColumnDebounced(champ.id, $event)"
                  />
                </div>
              </template>
            </div>
          </template>
        </div>
        <slot name="otherSelected" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.button-text-xs {
  font-size: 0.875rem;
}

:deep(.fr-badge) {
  --text-default-grey: var(--grey-625-425);
}

.tabpane {
  position: relative;
  opacity: 0;
  max-height: 0;
  top: 1rem;
}
.active {
  display: block;
  opacity: 1;
  transition: all 0.5s ease;
  max-height: none;
  top: 0;
}
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
