<script setup lang="ts">
import {
  EOrganismeCategory,
  eOrganismeType,
} from '@biblio-num/shared'
import type { IAssociationOutput } from '@biblio-num/shared'
import LayoutFiche from '@/components/Layout/LayoutFiche.vue'
import FicheAssociationInfoTab from '@/views/organismes/association/info-tab/FicheAssociationInfoTab.vue'
import type { tInfoBanner } from '@/views/organismes/common/FicheBanner.vue'
import FicheBanner from '@/views/organismes/common/FicheBanner.vue'
import FileTab from '@/views/organismes/common/file-tab/FileTab.vue'
import EventsTab from '@/views/organismes/common/EventsTab.vue'
import { useUserStore } from '../../../stores'
import DossierTab from '@/views/organismes/common/DossierTab.vue'

const props = defineProps<{ association: IAssociationOutput }>()

const { currentUser } = useUserStore()

const banner = computed<tInfoBanner>(() => ({
  id: props.association.id,
  title: props.association.title,
  state: props.association.state,
  creationAt: props.association.creationAt,
  stateEffectiveAt: props.association.stateEffectiveAt,
  hub_timestamp: props.association.hub_timestamp,
  typeOrg: eOrganismeType.ASSO,
}))

const currentTab = ref<string | undefined>(undefined)
</script>

<template>
  <LayoutFiche
    class="overflow-auto"
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
            <FicheAssociationInfoTab :association="association" />
          </BnTab>

          <!--  Files  -->
          <BnTab
            id="FILES"
            title="Pièces jointes"
          >
            <FileTab
              :organisme-type="EOrganismeCategory.association"
              :files="association.files"
              :organisme-id="association.id"
            />
          </BnTab>

          <!-- Historique -->
          <BnTab
            id="events"
            title="Historique"
          >
            <EventsTab :events="association.events" />
          </BnTab>

          <BnTab
            id="dossiers"
            title="Dossier DS"
          >
            <DossierTab
              :role="currentUser?.role"
              :organisme-id="association.id"
            />
          </BnTab>
        </BnTabsContainer>
      </div>
    </template>
  </LayoutFiche>
</template>

<style scoped></style>
