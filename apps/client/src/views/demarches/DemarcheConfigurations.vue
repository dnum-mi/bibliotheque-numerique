<script lang="ts" setup>
import { computed, ref, type Ref } from 'vue'
import { useForm } from 'vee-validate'

import useToaster from '@/composables/use-toaster'
import { useDemarcheStore } from '@/stores'
import DemarcheConfiguration from '@/views/demarches/DemarcheConfiguration.vue'

withDefaults(defineProps<{
    dataJson?: object
  }>(), {
  dataJson: () => ({}),
})
const title = 'La configuration'

type TitleTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
type DsfrAlertType = 'error' | 'success' | 'warning' | 'info'

const demarcheStore = useDemarcheStore()
const demarcheConfigurations = computed(() => demarcheStore.demarcheConfigurations)
const alertType: Ref<DsfrAlertType> = ref('info')
const alertTitle = ref('')
const alertDescription = ref('')

const saveIcon = 'ri-save-line'
const updatingIcon = 'ri-refresh-line'
const isSaving = ref(false)
const updateIcon = computed(() => ({
  name: isSaving.value ? updatingIcon : saveIcon,
  ...(isSaving.value ? { animation: 'spin' } : {}),
}))

const toaster = useToaster()
const { handleSubmit } = useForm()
const submit = handleSubmit(async () => {
  if (isSaving.value) {
    return
  }
  try {
    isSaving.value = true
    await demarcheStore.updateDemarcheConfigurations(demarcheConfigurations.value)
    toaster.addMessage({
      description: 'Les champs ou les annotations sélectionnés sont bien ajoutés dans la colonne du tableau.',
      title: 'Mise à jour réussie !',
      type: 'success',
    })
  } catch (e) {
    toaster.addMessage({
      description: 'Une erreur s’est produite pendant la mise à jour des données.',
      title: 'Échec de mise à jour !',
      type: 'error',
    })
  } finally {
    isSaving.value = false
  }
})
</script>

<template>
  <div class="fr-container">
    <div>
      <DsfrAlert
        v-if="!!alertTitle"
        :type="alertType"
        :title="alertTitle"
        :description="alertDescription"
        :small="false"
        class="fr-mb-2w"
      />
    </div>
    <h3 class="fr-text-title--blue-france">
      {{ title }}
    </h3>
    <div class="fr-text--alt fr-pb-3w">
      Sélectionnez les champs ou les annotations privés afin de les afficher dans la liste des dossiers de cette démarche.
    </div>

    <div class="fr-pb-3v">
      <div class="fr-grid-row">
        <div class="fr-col-1 fr-p-2v">
          <label class="fr-text--bold" />
        </div>
        <div class="fr-col-2 fr-p-2v">
          <label class="fr-text--bold"> Type Champs</label>
        </div>
        <div class="fr-col-4 fr-p-2v">
          <label class="fr-text--bold"> Libellé origine</label>
        </div>
        <div class="fr-col-5 fr-p-2v">
          <label class="fr-text--bold"> Libellé personnalisé</label>
        </div>
      </div>
    </div>

    <form
      @submit="submit"
    >
      <hr>
      <DemarcheConfiguration
        :datas="demarcheConfigurations"
      />
      <div class="fixed  bottom-0  bg-white  w-full  top-shadow  text-right  fr-px-4w  left-0  z-1">
        <DsfrButton
          class="fr-my-2w"
        >
          Mettre à jour
          <VIcon v-bind="updateIcon" />
        </DsfrButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.top-shadow {
  filter: drop-shadow(0 1px 3px var(--shadow-color));
}

.w-full {
  width: 100vw;
}
.fixed {
  position: fixed;
}

.bottom-0 {
  bottom: 0;
}

.bg-white {
  background-color: var(--grey-1000-50);
}

.text-right {
  text-align: right;
}

.left-0 {
  left: 0em;
}

.fr-container {
  margin-bottom: 6rem;
}
</style>
