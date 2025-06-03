<script lang="ts" setup>
import type { IDemarche } from '@biblio-num/shared'
import { useDemarcheStore, useUserStore } from '@/stores'
import LayoutList from '@/components/Layout/LayoutList.vue'
import GroupInstructeurs from '@/views/demarches/demarche/information/DemarcheGrpInstructeurs.vue'
import DemarcheService from '@/views/demarches/demarche/information/DemarcheService.vue'
import DemarcheInformations from '@/views/demarches/demarche/information/DemarcheInformations.vue'
import DemarcheConfigurations from '@/views/demarches/demarche/configuration/DemarcheConfigurations.vue'
import DemarcheDossiers from '@/views/demarches/demarche/dossiers/DemarcheDossiers.vue'
import DemarcheOptions from '@/views/demarches/demarche/options/DemarcheOptions.vue'
import { getRandomString } from '@gouvminint/vue-dsfr'

const props = defineProps<{ demarcheId: string; customDisplayId?: string }>()

const demarcheStore = useDemarcheStore()
const userStore = useUserStore()

const demarche = computed<IDemarche | undefined>(() => demarcheStore.currentDemarche)

onMounted(async () => {
  if (props.demarcheId) {
    await demarcheStore.getDemarche(Number(props.demarcheId))
  }
})

const currentDemarcheTab = ref<string | undefined>('dossiers')
const demarcheDossiersKey = ref(`demarche-dossiers-${getRandomString(5)}`)

const canConfigureDemarche = computed(() => userStore.CanConfigureDemarche(Number(props.demarcheId)))

const handleTabChanged = (newTabId?: string) => {
  if (newTabId === 'dossiers') {
    demarcheDossiersKey.value = `demarche-dossiers-${getRandomString(5)}`
  }
}
</script>

<template>
  <LayoutList
    v-if="demarche"
    :title="`${demarche.title} - N°${demarche.dsDataJson?.number || ''}`"
    title-bg-color="var(--artwork-minor-blue-france)"
    title-icon=""
  >
    <BnTabsContainer
      v-model="currentDemarcheTab"
      default-tab-id="dossiers"
      @tab-changed="handleTabChanged"
    >
      <BnTab
        id="dossiers"
        title="Dossiers"
      >
        <DemarcheDossiers
          id="demarche-dossiers"
          :key="demarcheDossiersKey"
          :custom-display-id="customDisplayId"
        />
      </BnTab>
      <BnTab
        id="information"
        title="Information"
      >
        <DemarcheInformations class="fr-pt-3w" />
        <DemarcheService class="fr-pt-5w" />
        <GroupInstructeurs class="fr-pt-5w" />
      </BnTab>
      <BnTab
        v-if="canConfigureDemarche"
        id="parametrage"
        title="Paramètrage d'affichage"
      >
        <KeepAlive>
          <DemarcheConfigurations />
        </KeepAlive>
      </BnTab>
      <BnTab
        v-if="canConfigureDemarche"
        id="options"
        title="Options"
      >
        <KeepAlive>
          <DemarcheOptions />
        </KeepAlive>
      </BnTab>
    </BnTabsContainer>
  </LayoutList>
</template>
