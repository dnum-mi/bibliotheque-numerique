<script lang="ts" setup>
import type {
  ISmallDemarcheOutput,
  IdentificationDemarcheKeys, OrganismeTypeKeys,
} from '@biblio-num/shared'
import { useConfigurationStore } from '@/stores/configuration'
import { ref } from 'vue'

const configurationStore = useConfigurationStore()

const demarcheIdString = ref('')
const demarcheId = computed<number | null>(() => Number(demarcheIdString.value) ?? null)

const identification = ref<string>()

const typesString = ref('')
const types = computed<OrganismeTypeKeys[]>(() => (typesString.value ? JSON.parse(typesString.value) : undefined))

const demarches = computed<ISmallDemarcheOutput[]>(() => configurationStore.demarches)
const loading = computed<boolean>(() => configurationStore.fetching)

const identificationValue = computed<IdentificationDemarcheKeys | null | undefined>(() => {
  switch (identification.value) {
    case '':
      return undefined
    case 'null':
      return null
    default:
      return identification.value
  }
})

const inputDsIdString = ref('')
const inputDsId = computed(() => Number(inputDsIdString.value) ?? null)
const createModalOpen = ref(false)
const onCreateDemarche = async () => {
  createModalOpen.value = true
}

const closeFilterModal = () => {
  createModalOpen.value = false
}

const createDemarche = () => {
  if (inputDsId.value) {
    configurationStore.addDemarches(inputDsId.value)
  }
  createModalOpen.value = false
}

const onClickSynchronise = async (demarcheId: number) => {
  await configurationStore.synchronizeOneDemarche(demarcheId)
}

const onClickUpdateDemarche = async () => {
  await configurationStore.updateDemarche(demarcheId.value, identificationValue.value, types.value)
}

onMounted(async () => {
  await configurationStore.loadDemarches()
})
</script>

<template>
  <div :class="{ 'blur-2': loading }">
    <div class="flex flex-row fr-mb-1w">
      <div class="flex-1">
        <h6>Modifier une démarche</h6>
      </div>
      <div class="flex-1 text-right">
        <DsfrButton
          label="Créer une nouvelle démarche"
          class="fr-m-0"
          primary
          @click="onCreateDemarche()"
        />
      </div>
    </div>
    <div class="flex flex-row gap-2">
      <DsfrInputGroup
        v-model="demarcheIdString"
        type="number"
        label="Démarche"
        hint="Id de la démarche dans BN"
        label-visible
      />

      <DsfrInputGroup
        v-model="identification"
        type="text"
        label="Identification"
        hint="FE (calcul de délai d'instruction) ou null (Supprime la valeur)"
        label-visible
      />

      <DsfrInputGroup
        v-model="typesString"
        type="text"
        label="types"
        label-visible
        hint="liste: [ &quot;ARUP&quot;, &quot;CULTE&quot;, &quot;FE&quot;, &quot;FDD&quot;, &quot;FRUP&quot; ]"
      />
    </div>
    <div class="flex flex-row gap-2">
      <DsfrButton
        label="Modifier"
        secondary
        @click="onClickUpdateDemarche()"
      />
    </div>

    <!-- LISTER LES DEMARCHES -->
    <h6 class="fr-mt-3w">
      Liste des démarches existantes
    </h6>
    <DsfrTable class="w-full text-center">
      <thead>
        <th>id</th>
        <th>N°Démarche</th>
        <th>Titre</th>
        <th>Types</th>
        <th>Identification</th>
        <th>Synchronisation forcée</th>
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
          <td>{{ demarche.identification }}</td>
          <td>
            <DsfrButton
              label="Forcer la synchronisation"
              secondary
              @click="onClickSynchronise(demarche.id)"
            />
          </td>
        </tr>
      </tbody>
    </DsfrTable>
  </div>

  <!--  CHARGEMENT -->
  <div
    v-if="loading"
    class="absolute w-full h-full top-0 left-0 opacity-30 bg-dark flex justify-center"
  />
  <div
    v-if="loading"
    class="absolute w-full top-0 left-0 flex justify-center"
  >
    <div class="flex flex-col justify-center items-center">
      <VIcon
        class="mt-50"
        name="ri-refresh-line"
        color="white"
        scale="10"
        animation="spin"
      />
      <p class="text-white text-3xl">
        chargement en cours...
      </p>
    </div>
  </div>

  <!-- MODAL DE CREATION DE DEMARCHE -->
  <DsfrModal
    :opened="createModalOpen"
    :title="'Créer une nouvelle démarche depuis DS'"
    @close="closeFilterModal"
  >
    <DsfrInput
      v-model="inputDsIdString"
      type="text"
      label="Numéro (id) de la démarche dans DS"
      label-visible
      class="mb-4"
      placeholder="ex: 875678"
    />
    <DsfrButton
      label="Créer"
      class="float-right mb-5"
      @click="createDemarche()"
    />
  </DsfrModal>
</template>
