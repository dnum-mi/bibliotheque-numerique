<script setup lang="ts">
import {
  EOrganismeCategory,
  eOrganismeType,
} from '@biblio-num/shared'
import type { IAssociationOutput } from '@biblio-num/shared'
import FicheAssociationInfoTab from '@/views/organismes/association/info-tab/FicheAssociationInfoTab.vue'
import FicheSidebar from '@/views/organismes/components/FicheSidebar.vue'
import type { tInfoSidebar } from '@/views/organismes/components/FicheSidebar.vue'
import FileTab from '../common/file-tab/FileTab.vue'
import { getServiceInstructeurFromEvents } from '@/utils'
import EtablissementTab from '../common/EtablissementTab.vue'
import DirigeantTab from '../common/member-tab/MemberTab.vue'
import DossierListTab from '../common/dossier-list-tab/DossierListTab.vue'

const props = defineProps<{ association: IAssociationOutput }>()

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
  isPersonDataPrivate: props.association.isPersonDataPrivate,
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

          <!-- Liste des dossiers -->
          <BnTab
            id="liste-des-dossiers"
            title="Liste des dossiers"
          >
            <template #icon>
              <span class="fr-icon-folder-2-fill" aria-hidden="true" />
            </template>
            <DossierListTab
              :organisme-id="association.id"
              :organisme-type="EOrganismeCategory.association"
            />
          </BnTab>
        </BnTabsContainer>
      </div>
    </template>
  </LayoutOrganisme>
</template>

<style scoped></style>
