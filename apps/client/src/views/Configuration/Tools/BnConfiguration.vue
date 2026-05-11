<script lang="ts" setup>
import { computed, nextTick, onMounted, ref } from 'vue'

import type { IBnConfigurationOutput } from '@biblio-num/shared'
import useToaster from '@/composables/use-toaster'
import { useConfigurationStore } from '@/stores/configuration'

const toaster = useToaster()

const configurationStore = useConfigurationStore()

// --- Formulaire d’édition ---
const keyNameString = ref('')
const keyName = computed<string | undefined>({
  get: () => keyNameString.value || '',
  set: (val) => {
    keyNameString.value = val ?? ''
  },
})

const stringValue = ref<string>('')
const valueTypeString = ref('')

const bnConfigurations = computed<IBnConfigurationOutput[]>(() => configurationStore.bnConfigurations)
const loading = computed<boolean>(() => configurationStore.fetchingConfigurations.bn)

const inputId = ref<number | undefined>()

// Pour mettre en avant la ligne sélectionnée
const selectedId = ref<number | null>(null)

// Références pour scroll/focus
const formContainerRef = ref<HTMLElement | null>(null)

// --- Création ---
const inputKeyName = ref('')
const inputStringValue = ref('')
const inputValueType = ref('')

const createModalOpen = ref(false)
const onCreateBnConfiguration = async () => {
  createModalOpen.value = true
}

const closeFilterModal = () => {
  createModalOpen.value = false
}

const createBnConfiguration = () => {
  configurationStore.addBnConfigurations(inputKeyName.value, inputStringValue.value, inputValueType.value)
  createModalOpen.value = false

  // On nettoie les champs du modal
  inputKeyName.value = ''
  inputStringValue.value = ''
  inputValueType.value = ''
}

// --- Actions ---
const onClickUpdateBnConfiguration = async () => {
  await configurationStore.updateBnConfigurations(inputId.value, keyNameString.value, stringValue.value, valueTypeString.value)

  // Toast de confirmation
  toaster.addSuccessMessage('Configuration mise à jour avec succès')

  // Nettoyage des inputs d’édition
  keyNameString.value = ''
  stringValue.value = ''
  valueTypeString.value = ''
  inputId.value = undefined
  selectedId.value = null
}

onMounted(async () => {
  await configurationStore.loadBnConfigurations()
})

const scrollToFormAndFocus = async () => {
  await nextTick()

  if (formContainerRef.value) {
    formContainerRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })

    const input = formContainerRef.value.querySelector('.focus input') as HTMLInputElement | null
    input?.focus()
  }
}

const onSelected = (bnConfig: IBnConfigurationOutput) => {
  keyNameString.value = bnConfig.keyName.toString() || ''
  stringValue.value = bnConfig.stringValue || ''
  valueTypeString.value = bnConfig.valueType || ''
  inputId.value = bnConfig.id
  selectedId.value = bnConfig.id

  void scrollToFormAndFocus()
}
</script>

<template>
  <div
    ref="formContainerRef"
    class="fr-p-3v m-5"
    :class="{ 'blur-2': loading }"
  >
    <div class="flex flex-row items-center">
      <div class="flex-1">
        <h6>Modifier une configuration</h6>
      </div>
      <div class="flex-1 text-right">
        <DsfrButton
          label="Créer une nouvelle configuration"
          class="fr-m-0"
          primary
          @click="onCreateBnConfiguration()"
        />
      </div>
    </div>

    <hr role="presentation" class="fr-mt-2w fr-mb-3w">

    <div class="flex justify-between items-center">
      <div class="flex flex-row gap-2">
        <DsfrInputGroup
          v-model="keyName"
          type="text"
          label="Nom"
          hint="Nom de la configuration à modifier"
          label-visible
        />

        <DsfrInputGroup
          v-model="valueTypeString"
          type="text"
          label="Type de valeur"
          hint="string, number, boolean, ..."
          label-visible
        />

        <DsfrInputGroup
          v-model="stringValue"
          class="focus"
          type="text"
          label="Valeur"
          hint="La valeur de la configuration à modifier"
          label-visible
        />
      </div>

      <DsfrButton
        label="Modifier"
        secondary
        :disabled="!inputId"
        @click="onClickUpdateBnConfiguration()"
      />
    </div>

    <hr role="presentation" class="fr-mt-1w fr-mb-3w">

    <DsfrTable
      class="w-full text-center"
      title="Liste des configurations existantes"
    >
      <thead>
        <th>Id</th>
        <th>KeyName</th>
        <th>StringValue</th>
        <th>ValueType</th>
      </thead>
      <tbody>
        <tr
          v-for="bnConfig in bnConfigurations"
          :key="bnConfig.id"
          class="config-row"
          :class="{ 'config-row--selected': bnConfig.id === selectedId }"
          @click="onSelected(bnConfig)"
        >
          <td>{{ bnConfig.id }}</td>
          <td>{{ bnConfig.keyName }}</td>
          <td>{{ bnConfig.stringValue }}</td>
          <td>{{ bnConfig.valueType }}</td>
        </tr>
      </tbody>
    </DsfrTable>
  </div>

  <!-- MODAL DE CREATION DE bnConfiguration -->
  <DsfrModal
    :opened="createModalOpen"
    title="Créer une bnConfiguration"
    @close="closeFilterModal"
  >
    <form @submit.prevent="createBnConfiguration()">
      <DsfrInput
        v-model="inputKeyName"
        type="text"
        label="Nom de la configuration"
        label-visible
        class="mb-4"
        placeholder="ex:EXCEL_IMPORT_SHEET_NAME"
      />
      <DsfrInput
        v-model="inputStringValue"
        type="text"
        label="Valeur de la configuration"
        label-visible
        class="mb-4"
        placeholder="ex:Sheet1"
      />
      <DsfrInput
        v-model="inputValueType"
        type="text"
        label="Type de valeur"
        label-visible
        class="mb-4"
        placeholder="ex:string"
      />
      <DsfrButton
        type="submit"
        label="Créer"
        class="float-right mb-5"
      />
    </form>
  </DsfrModal>
</template>

<style scoped>
.config-row {
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}

.config-row:hover {
  background-color: var(--background-alt-blue-france, #e3f2ff);
}

.config-row--selected {
  background-color: var(--background-open-blue-france, #d7e9ff);
  font-weight: 600;
}
</style>
