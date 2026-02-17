<script setup lang="ts">
import {
  EOrganismeCategory,
  eOrganismeType,
} from '@biblio-num/shared'
import type { IAssociationOutput } from '@biblio-num/shared'
import FicheAssociationInfoTab from '@/views/organismes/association/info-tab/FicheAssociationInfoTab.vue'
import EventsTab from '@/views/organismes/common/EventsTab.vue'
import { useUserStore } from '@/stores'
import DossierTab from '@/views/organismes/common/DossierTab.vue'
import FicheSidebar from '@/views/organismes/components/FicheSidebar.vue'
import type { tInfoSidebar } from '@/views/organismes/components/FicheSidebar.vue'
import FileTab from '../common/file-tab/FileTab.vue'
import { getServiceInstructeurFromEvents } from '@/utils'
import EtablissementTab from '../common/EtablissementTab.vue'
import DirigeantTab from '../common/member-tab/MemberTab.vue'

const props = defineProps<{ association: IAssociationOutput }>()

const { currentUser } = useUserStore()

const serviceInstructeur = computed(() =>
  getServiceInstructeurFromEvents(props.association.events?.[0]?.dossierInstructeurGroup),
)

const sidebar = computed<tInfoSidebar>(() => ({
  id: props.association.id,
  organismeType: EOrganismeCategory.association,
  state: props.association.state,
  creationAt: props.association.creationAt,
  stateEffectiveAt: props.association.stateEffectiveAt,
  hub_timestamp: props.association.hub_timestamp,
  typeOrg: eOrganismeType.ASSO,
  prefecture: serviceInstructeur.value,
}))

const currentTab = ref<string | undefined>(undefined)
</script>

<template>
  <LayoutOrganisme
    :title="`${association.id} - ${association.title}`"
  >
    <!--  SIDEBAR  -->
    <template #sidebar>
      <FicheSidebar :sidebar="sidebar" />
    </template>

    <!--  CONTENT  -->
    <template #content>
      <div class="w-full h-full">
        <BnTabsContainer
          v-model="currentTab"
          default-tab-id="info"
        >
          <!--  INFO  -->
          <BnTab
            id="description"
            title="Description"
          >
            <template #icon>
              <span class="fr-icon-profil-fill" aria-hidden="true" />
            </template>
            <FicheAssociationInfoTab :association="association" />
          </BnTab>

          <!--  BE  -->
          <BnTab
            id="members"
            title="Dirigeants"
          >
            <template #icon>
              <span class="fr-icon-team-fill" aria-hidden="true" />
            </template>
            <DirigeantTab :persons="association.persons" />
          </BnTab>

          <!--  Files  -->
          <BnTab
            id="files"
            title="Pièces jointes"
          >
            <template #icon>
              <span class="fr-icon-file-text-fill" aria-hidden="true" />
            </template>
            <FileTab
              :organisme-type="EOrganismeCategory.association"
              :files="association.files"
              :organisme-id="association.id"
            />
          </BnTab>

          <!--  Etablissements  -->
          <BnTab
            id="institutions"
            title="Établissements"
          >
            <template #icon>
              <span class="fr-icon-community-fill" aria-hidden="true" />
            </template>
            <EtablissementTab
              :acquired-establishments="association.acquiredEstablishments"
              :secondary-establishments="association.secondaryEstablishments"
              :ceded-establishments="association.cededEstablishments"
            />
          </BnTab>

          <!-- Historique -->
          <BnTab
            id="events"
            title="Historique"
          >
            <template #icon>
              <span class="fr-icon-survey-fill" aria-hidden="true" />
            </template>
            <EventsTab :events="association.events" />
          </BnTab>

          <BnTab
            id="dossiers"
            title="Dossier DS"
          >
            <template #icon>
              <span class="fr-icon-folder-2-fill" aria-hidden="true" />
            </template>
            <DossierTab
              :role="currentUser?.role"
              :organisme-id="association.id"
            />
          </BnTab>
        </BnTabsContainer>
      </div>
    </template>
  </LayoutOrganisme>
</template>

<style scoped></style>
