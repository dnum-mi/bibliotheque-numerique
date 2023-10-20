<script lang="ts" setup>
import { computed } from 'vue'
import DossierMessage from './DossierMessage.vue'
import { getInitialsFromName } from '@/utils/name-to-initials'
import type { Demandeur, PersonnePhysique, TDossier } from '@biblio-num/shared'

type PopulatedDossier = TDossier & { demandeur: Demandeur & PersonnePhysique & { email: string } } | Record<string, never>

const props = withDefaults(defineProps<{
    datas?: PopulatedDossier
  }>(), {
  datas: () => ({}),
})
const messages = computed(() => props.datas?.messages || [])
// TODO: add demandeur email in objet dossier
const demandeurEmail = computed(() => props.datas?.demandeur.email)
const demandeurInitials = computed(() => getInitialsFromName(props.datas?.demandeur.nom + ' ' + props.datas?.demandeur.prenom) || '')
</script>

<template>
  <div class="fr-container">
    <div
      v-if="datas"
      class="fr-container"
    >
      <div class="fr-grid-row">
        <div
          v-for="{ id, email, body, createdAt, attachment } in messages"
          :key="id"
          class="fr-col-12 fr-grid-row"
        >
          <DossierMessage
            data-cy="dossier-message"
            :email="email"
            :body="body"
            :created-at="createdAt"
            :attachment="attachment"
            :demandeur="(demandeurEmail === email) ? demandeurInitials : false"
          />
        </div>
      </div>
    </div>
  </div>
</template>
