<script lang="ts" setup>
import { computed } from 'vue'
import DossierMessage from './DossierMessage.vue'
import { nameToInitials } from '@/utils/nameToInitials'

const props = withDefaults(defineProps<{
    datas?: object
  }>(), {
  datas: () => ({}),
})
const messages = computed(() => props.datas?.messages || [])
// TODO: add demandeur email in objet dossier
const demandeurEmail = computed(() => props.datas?.demandeur.email || [])
const demandeInitials = computed(() => nameToInitials(props.datas?.demandeur.nom + ' ' + props.datas?.demandeur.prenom).toUpperCase() || [])
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
            :demandeur="(demandeurEmail === email) ? demandeInitials : false"
          />
        </div>
      </div>
    </div>
  </div>
</template>
