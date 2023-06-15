<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useForm } from 'vee-validate'
import DemarcheConfiguration from '@/views/demarches/DemarcheConfiguration.vue'
import { useDemarcheStore } from '@/stores'

const props = withDefaults(defineProps<{
    dataJson?: object
  }>(), {
  dataJson: () => ({}),
})
const title = 'La configuration'

const demarcheStore = useDemarcheStore()
const demarcheConfigurations = computed<any[]>(() => demarcheStore.demarcheConfigurations)
const alertType = ref('')
const alertTitle = ref('')
const alertDescription = ref('')

const { handleSubmit } = useForm()
const submit = handleSubmit(async () => {
  try {
    await demarcheStore.updateDemarcheConfigurations(demarcheConfigurations)
    alertType.value = 'success'
    alertTitle.value = 'Mise à jour réussi!'
    alertDescription.value = 'Les champs ou les annotations sélectionnées sont bien ajoutés dans la colonne du tableau.'
  } catch (e) {
    console.error('Update demarche configurations Error')
    alertType.value = 'error'
    alertTitle.value = 'Échec de mise à jour!'
    alertDescription.value = 'Une erreur s\'est produite pendant la mise à jour des données.'
  }
})

</script>

<template>
  <div class="fr-container">
    <div>
      <DsfrAlert
        v-if="!!alertType"
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

    <div class="fr-container fr-pb-3v">
      <div class="fr-grid-row">
        <div class="fr-col-1 fr-p-2v">
          <label class="fr-text--bold" />
        </div>
        <div class="fr-col-1 fr-p-2v">
          <label class="fr-text--bold"> Type Champs</label>
        </div>
        <div class="fr-col-4 fr-p-2v">
          <label class="fr-text--bold"> Libellé origine</label>
        </div>
        <div class="fr-col-4 fr-p-2v">
          <label class="fr-text--bold"> Libellé personnalisé</label>
        </div>
        <div class="fr-col-2 fr-p-2v">
          <label class="fr-text--bold"> Valeur Type</label>
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
      <hr>
      <DsfrButton class="fr-mb-3w">
        Mettre à jour
      </DsfrButton>
    </form>
  </div>
</template>
