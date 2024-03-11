<script lang="ts" setup>
import { ref } from 'vue'

import type { IBnConfigurationOutput } from '@biblio-num/shared'

import { useConfigurationStore } from '@/stores/configuration'

const configurationStore = useConfigurationStore()

const keyNameString = ref('')
const keyName = computed<string | undefined>(() => keyNameString.value ?? undefined)

const stringValue = ref<string>('')

const valueTypeString = ref('')

const bnConfigurations = computed<IBnConfigurationOutput[]>(() => configurationStore.bnConfigurations)
const loading = computed<boolean>(() => configurationStore.fetchingBnConfigurations)

const inputId = ref<number>()

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
}

const onClickUpdateBnConfiguration = async () => {
  await configurationStore.updateBnConfigurations(inputId.value, keyNameString.value, stringValue.value, valueTypeString.value)
}

onMounted(async () => {
  await configurationStore.loadBnConfigurations()
})

const onSelected = (bnConfig: IBnConfigurationOutput) => {
  keyNameString.value = bnConfig.keyName.toString() || ''
  stringValue.value = bnConfig.stringValue || ''
  valueTypeString.value = bnConfig.valueType || ''
  inputId.value = bnConfig.id
}
</script>

<template>
  <div :class="{ 'blur-2': loading }">
    <div class="flex flex-row fr-mb-1w">
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
    <div class="flex flex-row gap-2">
      <DsfrInputGroup
        v-model="keyName"
        type="text"
        label="Nom"
        hint="Nom de la configuration à modifier"
        label-visible
      />

      <DsfrInputGroup
        v-model="stringValue"
        type="text"
        label="Valeur"
        hint="La valeur de la configuration à modifier"
        label-visible
      />

      <DsfrInputGroup
        v-model="valueTypeString"
        type="text"
        label="Type de valeur"
        hint="string, number, boolean, ..."
        label-visible
      />
    </div>
    <div class="flex flex-row gap-2">
      <DsfrButton
        label="Modifier"
        secondary
        @click="onClickUpdateBnConfiguration()"
      />
    </div>

    <!-- LISTER LES DEMARCHES -->
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
