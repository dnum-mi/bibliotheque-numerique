<script lang="ts" setup>
import { ref } from 'vue'

import type { ISmallDemarcheOutput, IdentificationDemarcheKeys, OrganismeTypeKey } from '@biblio-num/shared'
import ModalConfirm from '@/components/ModalConfirm.vue'
import { useConfigurationStore } from '@/stores/configuration'
import { synchroniseOneDossier, synchroniseOneOrganisme } from '@/api/sudo-api-client'

const configurationStore = useConfigurationStore()
const modalRef = ref<InstanceType<typeof ModalConfirm> | null>(null)
const demarcheIdString = ref('')
const demarcheId = computed<number | null>(() => Number(demarcheIdString.value) ?? null)

const identification = ref<string>()

const typesString = ref('')
const types = computed<OrganismeTypeKey[]>(() => (typesString.value ? JSON.parse(typesString.value) : undefined))

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

//#region CREATE DEMARCHE
const inputDsIdString = ref('')
const inputDsId = computed(() => Number(inputDsIdString.value) ?? null)
const createModalOpen = ref(false)
const onCreateDemarche = async () => {
  createModalOpen.value = true
}
const closeFilterModal = () => {
  createModalOpen.value = false
}
const createDemarcheFct = () => {
  if (inputDsId.value) {
    configurationStore.addDemarches(inputDsId.value)
  }
  createModalOpen.value = false
}
//#endregion

//#region SYNCHRONISE DOSSIER
const inputSynchroniseDossierIdString = ref('')
const inputSynchroniseDossierId = computed(() => Number(inputSynchroniseDossierIdString.value) ?? null)
const synchroniseModalOpen = ref(false)
const onSynchroniseDossier = async () => {
  synchroniseModalOpen.value = true
}
const closeSynchroniseModal = async () => {
  synchroniseModalOpen.value = false
}
const synchroniseOneDossierFct = async () => {
  if (inputSynchroniseDossierId.value) {
    await synchroniseOneDossier(inputSynchroniseDossierId.value)
  }
  synchroniseModalOpen.value = false
}
//#endregion

//#region SYNCHRONISE ORGANISME
const inputSynchroniseOrganismeIdString = ref('')
const inputSynchroniseOrganismeId = computed(() => Number(inputSynchroniseOrganismeIdString.value) ?? null)
const synchroniseOrganismeModalOpen = ref(false)
const onSynchroniseOrganisme = async () => {
  synchroniseOrganismeModalOpen.value = true
}
const closeSynchroniseOrganismeModal = async () => {
  synchroniseOrganismeModalOpen.value = false
}
const synchroniseOneOrganismeFct = async () => {
  if (inputSynchroniseOrganismeId.value) {
    await synchroniseOneOrganisme(inputSynchroniseOrganismeId.value)
  }
  synchroniseOrganismeModalOpen.value = false
}
//#endregion

const onClickSynchronise = async (demarcheId: number) => {
  await configurationStore.synchronizeOneDemarche(demarcheId)
}

const onClickUpdateDemarche = async () => {
  await configurationStore.updateDemarche(demarcheId.value, identificationValue.value, types.value)
}

const onClickSoftDeleteDemarche = async (demarcheId: number) => {
  if (!modalRef.value) {
    return
  }
  const confirmed = await modalRef.value.open()
  if (confirmed) {
    await configurationStore.softDeleteDemarche(demarcheId)
  }
}

onMounted(async () => {
  await configurationStore.loadDemarches()
})
</script>

<template>
  <div
    :class="{ 'blur-2': loading }"
    v-bind="$attrs"
  >
    <div class="flex flex-row fr-mb-1w">
      <div class="flex-1/2">
        <h6>Modifier une démarche</h6>
      </div>
      <div class="flex-1/2 flex gap-2 items-center">
        <DsfrButton
          label="Synchroniser un organisme"
          class="flex-1"
          primary
          @click="onSynchroniseOrganisme()"
        />
        <DsfrButton
          label="Synchroniser un dossier"
          class="flex-1"
          primary
          @click="onSynchroniseDossier()"
        />
        <DsfrButton
          label="Créer une nouvelle démarche"
          class="flex-1"
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
        hint="Id de la démarche dans DS"
        label-visible
      />

      <DsfrInputGroup
        v-model="identification"
        type="text"
        label="Identification"
        hint="FE ou DDC ou null (Supprime la valeur)"
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
    <ModalConfirm ref="modalRef" message="Voulez-vous vraiment supprimer cette démarche ?" />
    <DsfrTable
      class="w-full text-center"
      title="Liste des démarches existantes"
    >
      <thead>
        <th>id</th>
        <th>N°Démarche</th>
        <th>Titre</th>
        <th>Types</th>
        <th>Identification</th>
        <th>Synchronisation forcée</th>
        <th>Supprimer</th>
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
          <td>
            <DsfrButton
              label="Supprimer"
              secondary
              @click="onClickSoftDeleteDemarche(demarche.id)"
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
    title="Créer une nouvelle démarche depuis DS"
    @close="closeFilterModal"
  >
    <form @submit.prevent="createDemarcheFct()">
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
        type="submit"
      />
    </form>
  </DsfrModal>

  <!-- MODAL DE SYNCHRONISATION DE DOSSIER -->
  <DsfrModal
    :opened="synchroniseModalOpen"
    title="Synchroniser un dossier from scratch"
    @close="closeSynchroniseModal"
  >
    <form @submit.prevent="synchroniseOneDossierFct()">
      <DsfrInput
        v-model="inputSynchroniseDossierIdString"
        type="text"
        label="Numéro (id) du dossier dans BN"
        label-visible
        class="mb-4"
        placeholder="ex: 875678"
      />
      <DsfrButton
        label="Synchroniser"
        class="float-right mb-5"
        type="submit"
      />
    </form>
  </DsfrModal>

  <!-- MODAL DE SYNCHRONISATION DE ORGANISME -->
  <DsfrModal
    :opened="synchroniseOrganismeModalOpen"
    title="Synchroniser un organisme from scratch"
    @close="closeSynchroniseOrganismeModal"
  >
    <form @submit.prevent="synchroniseOneOrganismeFct()">
      <DsfrInput
        v-model="inputSynchroniseOrganismeIdString"
        type="text"
        label="Numéro (id) du organisme dans BN"
        label-visible
        class="mb-4"
        placeholder="ex: 875678"
      />
      <DsfrButton
        label="Synchroniser"
        class="float-right mb-5"
        type="submit"
      />
    </form>
  </DsfrModal>
</template>
