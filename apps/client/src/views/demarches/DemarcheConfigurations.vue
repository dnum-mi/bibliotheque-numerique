<script lang="ts" setup>
import { computed, ref, type Ref } from 'vue'
import { useForm } from 'vee-validate'

import useToaster from '@/composables/use-toaster'
import { useDemarcheStore } from '@/stores'
import DemarcheConfiguration from '@/views/demarches/DemarcheConfiguration.vue'

const title = 'La configuration'

type DsfrAlertType = 'error' | 'success' | 'warning' | 'info'

const demarcheStore = useDemarcheStore()
const demarcheConfiguration = computed(() => demarcheStore.currentDemarcheConfiguration)
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

    <hr>
    <DemarcheConfiguration
      :datas="demarcheConfigurations"
    />
  </div>
</template>
