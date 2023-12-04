<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import type {
  IdentificationDemarcheKeys,
  OrganismeTypeKeys,
  SmallDemarcheOutputDto,
} from '@biblio-num/shared'
import { useConfigurationStore } from '../../../stores/configuration'

const configurationStore = useConfigurationStore()

const idDsString = ref('')
const idDs = computed<number| null>(() => Number(idDsString.value) ?? null)

const identification = ref<string>()

const typesString = ref('')
const types = computed<OrganismeTypeKeys[]>(() => typesString.value ? JSON.parse(typesString.value) : undefined)

const demarches = computed<SmallDemarcheOutputDto[]>(() => configurationStore.demarches)
const loading = computed<boolean>(() => configurationStore.fetching)

const identificationOptions = [
  {
    text: 'Pas de modification',
    value: '',
  },
  {
    text: "Pour le calcul de délai d'instruction",
    value: 'FE',
  },
  {
    text: 'Aucune valeur',
    value: 'null',
  },

]

const identificationValue = computed<IdentificationDemarcheKeys| null | undefined>(() => {
  switch (identification.value) {
    case '':
      return undefined
    case 'null':
      return null
    default:
      return identification.value
  }
})

const onClickCreateDemarche = async () => {
  await configurationStore.addDemarches(idDs.value, identificationValue.value)
}

const onClickSynchroDossiers = async () => {
  await configurationStore.synchroDossiers(idDs.value)
}

const onClickUpdateDemarche = async () => {
  await configurationStore.updateDemarche(idDs.value, identificationValue.value, types.value)
}

onMounted(async () => {
  await configurationStore.loadDemarches()
})

const expandedId = ref()
</script>

<template>
  <h6>Synchronisation d'une démarche</h6>
  <span v-if="loading">
    En cours de chargement...
  </span>
  <div class="flex flex-row gap-2">
    <DsfrInputGroup
      v-model="idDsString"
      type="number"
      label="Démarche"
      hint="Numéro de dèmarche DS"
      label-visible
    />
    <DsfrSelect
      v-model="identification"
      label="Identification"
      :options="identificationOptions"
      description="format: FE ou null(pour supprimer)"
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

  <DsfrAccordion
    class="fr-pt-2w"
    title="Les démarches"
    :expanded-id="expandedId"
    @expand="expandedId = $event"
  >
    <DsfrTable class="w-full text-center">
      <thead>
        <th>id</th>
        <th>N°Démarche</th>
        <th>Titre</th>
        <th>Types</th>
      </thead>
      <tbody>
        <tr
          v-for="demarche in demarches"
          :key="demarche.id"
        >
          <td>
            {{ demarche.id }}
          </td>
          <td>{{ demarche.dsId }}</td>
          <td>{{ demarche.title }}</td>
          <td>{{ demarche.types }}</td>
        </tr>
      </tbody>
    </DsfrTable>
  </DsfrAccordion>
</template>
