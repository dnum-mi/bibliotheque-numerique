<script setup lang="ts">
import { EOrganismeCategory } from '@biblio-num/shared'
import type { IFoundationOutput } from '@biblio-num/shared'
import LayoutFiche from '@/components/Layout/LayoutFiche.vue'
import FicheFoundationInfoTab from '@/views/organismes/fondation/FicheFoundationInfoTab.vue'
import BeTab from '../common/BeTab.vue'
import FileTab from '@/views/organismes/common/file-tab/FileTab.vue'
import EventsTab from '@/views/organismes/common/EventsTab.vue'
import type { tInfoBanner } from '@/views/organismes/common/FicheBanner.vue'
import FicheBanner from '@/views/organismes/common/FicheBanner.vue'
import DossierTab from '@/views/organismes/common/DossierTab.vue'
import { useUserStore } from '@/stores'

const props = defineProps<{ foundation: IFoundationOutput }>()

const { currentUser } = useUserStore()

const banner = computed<tInfoBanner>(() => ({
  id: props.foundation.id,
  title: props.foundation.title,
  state: props.foundation.state,
  creationAt: props.foundation.creationAt,
  stateEffectiveAt: props.foundation.stateEffectiveAt,
  hub_timestamp: props.foundation.hub_timestamp,
  typeOrg: props.foundation.foundationType,
}))

const currentTab = ref<string | undefined>(undefined)
</script>

<template>
  <LayoutFiche
    class="overflow-auto h-full"
    title-bg-color="var(--grey-200-850)"
    title-fg-color="var(--text-inverted-grey)"
  >
    <!--  BANNER  -->
    <template #title>
      <FicheBanner :banner />
    </template>

    <!--  CONTENT  -->
    <template #content>
      <div class="w-full h-full pl-4">
        <BnTabsContainer
          v-model="currentTab"
          default-tab-id="info"
        >
          <!--  INFO  -->
          <BnTab
            id="INFO"
            title="Infos"
          >
            <FicheFoundationInfoTab :foundation="foundation" />
          </BnTab>

          <!--  BE  -->
          <BnTab
            id="BE"
            title="Bénéficiaires effectifs"
          >
            <BeTab :persons="foundation.persons" :is-person-data-private="foundation.isPersonDataPrivate" />
          </BnTab>

          <!--  Files  -->
          <BnTab
            id="FILES"
            title="Pièces jointes"
          >
            <FileTab
              :organisme-type="EOrganismeCategory.fondation"
              :files="foundation.files"
              :organisme-id="foundation.id"
            />
          </BnTab>

          <!-- Historique -->
          <BnTab
            id="events"
            title="Historique"
          >
            <EventsTab
              :events="foundation.events"
            />
          </BnTab>

          <BnTab
            id="dossiers"
            title="Dossier DS"
          >
            <DossierTab
              :role="currentUser?.role"
              :organisme-id="foundation.id"
            />
          </BnTab>
        </BnTabsContainer>
      </div>
    </template>
  </LayoutFiche>
</template>

<style scoped>
</style>
