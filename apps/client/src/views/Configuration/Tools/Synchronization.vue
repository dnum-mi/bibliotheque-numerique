<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import type {
  IdentificationDemarcheKeys,
  OrganismeTypeKeys,
} from '@biblio-num/shared'
import { useConfigurationStore } from '../../../stores/configuration'

const configurationStore = useConfigurationStore()

const idDsString = ref('')
const identifcation = ref<IdentificationDemarcheKeys>()
const idDs = computed<number| null>(() => Number(idDsString.value) ?? null)
const typesString = ref('')
const types = computed<OrganismeTypeKeys[]>(() => typesString.value ? JSON.parse(typesString.value) : undefined)

// const demarches = computed<SmallDemarcheOutputDto[]>(() => configurationStore.demarches)
const loading = computed<boolean>(() => configurationStore.fetching)
const onClickCreateDemarche = async () => {
  await configurationStore.addDemarches(idDs.value, identifcation.value)
}

const onClickSynchroDossiers = async () => {
  await configurationStore.synchroDossiers(idDs.value)
}

const onClickUpdateDemarche = async () => {
  await configurationStore.updateDemarche(idDs.value, identifcation.value, types.value)
}

onMounted(async () => {
  await configurationStore.loadDemarches()
})
</script>

<template>
  <h6>Synchronisation d'une démarche</h6>
  <span v-if="loading">
    ...En cours de traitement
  </span>
  <div class="flex flex-row gap-2">
    <DsfrInputGroup
      v-model="idDsString"
      type="number"
      label="Dèmarche"
      hint="Numéro de dèmarche DS"
      label-visible
    />
    <DsfrInputGroup
      v-model="identifcation"
      type="text"
      label="Identification"
      label-visible
      hint="format: FE"
    />

    <DsfrInputGroup
      v-model="typesString"
      type="text"
      label="types"
      label-visible
      hint="format: ex: [ &quot;ARUP&quot;, &quot;CUTLTE&quot;, &quot;FE&quot;, &quot;FDD&quot;, &quot;FRUP&quot; ]"
    />
  </div>
  <div class="flex flex-row gap-2">
    <DsfrButton
      label="Créer la demarche"
      secondary
      @click="onClickCreateDemarche()"
    />
    <DsfrButton
      label="Synchroniser les dossiers"
      secondary
      @click="onClickSynchroDossiers()"
    />
    <DsfrButton
      label="Modifier la démarche"
      secondary
      @click="onClickUpdateDemarche()"
    />
  </div>
</template>
