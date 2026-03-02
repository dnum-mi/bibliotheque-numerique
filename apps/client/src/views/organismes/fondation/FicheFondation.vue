<script setup lang="ts">
import { EOrganismeCategory } from '@biblio-num/shared'
import type { IFoundationOutput } from '@biblio-num/shared'
import FicheFoundationInfoTab from '@/views/organismes/fondation/FicheFoundationInfoTab.vue'
import EventsTab from '@/views/organismes/common/EventsTab.vue'
import FicheSidebar from '@/views/organismes/components/FicheSidebar.vue'
import type { tInfoSidebar } from '@/views/organismes/components/FicheSidebar.vue'
import DossierTab from '@/views/organismes/common/DossierTab.vue'
import { useUserStore } from '@/stores'
import FileTab from '../common/file-tab/FileTab.vue'
import DirigeantTab from '../common/member-tab/MemberTab.vue'
import { getServiceInstructeurFromEvents } from '@/utils'
import DossierListTabs from '../common/DossierListTabs.vue'

const props = defineProps<{ foundation: IFoundationOutput }>()

const { currentUser } = useUserStore()

const serviceInstructeur = computed(() =>
  getServiceInstructeurFromEvents(props.foundation.events?.[0]?.dossierInstructeurGroup),
)

const sidebar = computed<tInfoSidebar>(() => ({
  id: props.foundation.id,
  organismeType: EOrganismeCategory.fondation,
  state: props.foundation.state,
  creationAt: props.foundation.creationAt,
  stateEffectiveAt: props.foundation.stateEffectiveAt,
  typeOrg: props.foundation.foundationType,
  prefecture: serviceInstructeur.value,
  isPersonDataPrivate: props.foundation.isPersonDataPrivate,
}))

const currentTab = ref<string | undefined>(undefined)
</script>

<template>
  <LayoutOrganisme
    :title="`${foundation.id} - ${foundation.title}`"
  >
    <!--  ASIDE  -->
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
            <FicheFoundationInfoTab :foundation="foundation" />
          </BnTab>

          <!--  BE  -->
          <BnTab
            id="members"
            title="Dirigeants"
          >
            <template #icon>
              <span class="fr-icon-team-fill" aria-hidden="true" />
            </template>
            <DirigeantTab :persons="foundation.persons" />
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
            <template #icon>
              <span class="fr-icon-survey-fill" aria-hidden="true" />
            </template>
            <EventsTab
              :events="foundation.events"
            />
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
              :organisme-id="foundation.id"
            />
          </BnTab>

          <!-- Liste des dossiers -->
          <BnTab
            id="liste-des-dossiers"
            title="Liste des dossiers"
          >
            <template #icon>
              <span class="fr-icon-folder-2-fill" aria-hidden="true" />
            </template>
            <DossierListTabs
              :role="currentUser?.role"
              :organisme-id="foundation.id"
              :organisme-type="EOrganismeCategory.fondation"
            />
          </BnTab>
        </BnTabsContainer>
      </div>
    </template>
  </LayoutOrganisme>
</template>

<style scoped>
</style>
