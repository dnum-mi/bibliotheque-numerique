<script lang='ts' setup>
import type { IDemarche } from '@biblio-num/shared'

import { DsfrSegmentedSet } from '@gouvminint/vue-dsfr'

import { useDemarcheStore, useUserStore } from '@/stores'
import LayoutList from '@/components/Layout/LayoutList.vue'
import GroupInstructeurs from '@/views/demarches/demarche/information/DemarcheGrpInstructeurs.vue'
import DemarcheService from '@/views/demarches/demarche/information/DemarcheService.vue'
import DemarcheInformations from '@/views/demarches/demarche/information/DemarcheInformations.vue'
import DemarcheConfigurations from '@/views/demarches/demarche/configuration/DemarcheConfigurations.vue'
import DemarcheDossiers from '@/views/demarches/demarche/dossiers/DemarcheDossiers.vue'
import DemarcheOptions from '@/views/demarches/demarche/options/DemarcheOptions.vue'

const props = defineProps<{ demarcheId: string; customDisplayId?: string }>()

const route = useRoute()
const router = useRouter()
const demarcheStore = useDemarcheStore()
const userStore = useUserStore()

const demarche = computed<IDemarche | undefined>(() => demarcheStore.currentDemarche)

onMounted(async () => {
  if (props.demarcheId) {
    await demarcheStore.getDemarche(Number(props.demarcheId))
  }
})

//#region Tab management */
const tabTitles = computed<{ value: number, label: string }[]>(() => [
  {
    value: 0,
    label: 'Dossiers',
  },
  {
    value: 1,
    label: 'Information',
  },
  ...(userStore.CanConfigureDemarche(Number(props.demarcheId))
    ? [
        { value: 2, label: 'Configuration' },
        { value: 3, label: 'Options' },
      ]
    : []),
])
const selectedTabIndex = ref(0)
const asc = ref(false)

watch(selectedTabIndex, (newValue, oldValue) => {
  asc.value = newValue > oldValue
  router.push({ ...route, hash: `#${tabTitles.value[newValue].label}` })
})

onMounted(() => {
  // The optional chaining operator is here for component testing, where route is nullish
  if (route?.hash.slice(1).length) {
    selectedTabIndex.value = tabTitles.value.findIndex((tabTitle) => route.hash.slice(1) === tabTitle.label) || 0
  }
})
const values = { true: '100%', false: '-100%' }
// @ts-expect-error this will be fine
const translateValueFrom = computed(() => values[String(asc?.value)])
// @ts-expect-error this will be fine
const translateValueTo = computed(() => values[String(!asc?.value)])
//#endregion */
</script>

<template>
  <LayoutList
    v-if="demarche"
    :title="`${demarche.title} - N°${demarche.dsDataJson?.number || ''}`"
    title-bg-color="var(--artwork-minor-blue-france)"
    title-icon=""
  >
    <div class="flex flex-col bn-scroll-parent bn-dynamic-big-pt">
      <DsfrSegmentedSet
        v-model="selectedTabIndex"
        :inline="false"
        :options="tabTitles"
        :small="false"
        class="simulate-tabs"
      />
      <Transition name="slide-fade" mode="in-out">
        <!-- Dossiers -->
        <div
          v-show="selectedTabIndex === 0"
          class="flex-grow bn-scroll-parent"
        >
          <DemarcheDossiers
            id="demarche-dossiers"
            :custom-display-id="customDisplayId"
          />
        </div>
      </Transition>
      <Transition name="slide-fade" mode="in-out">
        <!-- Informations -->
        <div
          v-show="selectedTabIndex === 1"
          class="flex-grow bn-scroll-parent"
        >
          <DemarcheInformations class="fr-pt-3w" />
          <DemarcheService class="fr-pt-5w" />
          <GroupInstructeurs class="fr-pt-5w" />
        </div>
      </Transition>
      <Transition name="slide-fade" mode="in-out">
        <!-- Configurations -->
        <div
          v-show="userStore.CanConfigureDemarche(Number(props.demarcheId)) && selectedTabIndex === 2"
          class="flex-grow bn-scroll-parent"
        >
          <KeepAlive>
            <DemarcheConfigurations />
          </KeepAlive>
        </div>
      </Transition>
      <Transition name="slide-fade" mode="in-out">
        <!-- Options -->
        <div
          v-show="userStore.CanConfigureDemarche(Number(props.demarcheId)) && selectedTabIndex === 3"
          class="flex-grow bn-scroll-parent"
        >
          <KeepAlive>
            <DemarcheOptions />
          </KeepAlive>
        </div>
      </Transition>
    </div>
  </LayoutList>
</template>

<style scoped>
.simulate-tabs {
  position: relative;
  border-bottom: 1px solid var(--border-default-grey);
}

:deep(.fr-segmented__elements) {
  gap: 0.5rem;
  box-shadow: none !important;
}

:deep(.fr-segmented__element) {
  border-radius: 0;
  background: var(--background-action-low-blue-france);
  font-weight: bolder !important;
}

:deep(.fr-segmented__element:hover) {
  background: var(--background-action-low-blue-france-hover) !important;
}

:deep(input:hover+label) {
  background: var(--background-action-low-blue-france-hover) !important;
}

:deep(input:checked+label) {
  background: white;
  color: var(--border-active-blue-france) !important;
  border: none;
  border-radius: 0;
  border-inline: 1px solid var(--border-default-grey);
  border-bottom: 1px solid white;
  margin-bottom: -1px;
  box-shadow: 0 -2px 0 0 var(--border-active-blue-france) !important;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from {
  transform: translateX(v-bind(translateValueFrom));
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(v-bind(translateValueTo));
  opacity: 0;
}
</style>
