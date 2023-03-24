<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useForm } from 'vee-validate'
import DemarcheConfiguration from '@/views/DemarcheConfiguration.vue'
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
const alertDescription = ref('')

const { handleSubmit } = useForm()
const submit = handleSubmit(async () => {
  try {
    await demarcheStore.updateDemarcheConfigurations(demarcheConfigurations)
    alertType.value = 'success'
    alertDescription.value = 'Mettre à jour succès!'
  } catch (e) {
    console.log('Update demarche configurations Error')
    alertType.value = 'error'
    alertDescription.value = 'Mettre à jour erreur!'
  }
})

</script>

<template>
  <div class="fr-container">
    <div>
      <DsfrAlert
        v-if="!!alertType"
        :type="alertType"
        :description="alertDescription"
        small="small"
      />
    </div>
    <h3> {{ title }} </h3>

    <div class="fr-container fr-pb-3v">
      <div class="fr-grid-row">
        <div class="fr-col-1 fr-p-2v">
          <label class="fr-text--bold"> Type Champs</label>
        </div>
        <div class="fr-col-1 fr-p-2v">
          <label class="fr-text--bold"> L'affiche dans la colonne :</label>
        </div>
        <div class="fr-col-3 fr-p-2v">
          <label class="fr-text--bold"> Libellé origine</label>
        </div>
        <div class="fr-col-3 fr-p-2v">
          <label class="fr-text--bold"> Libellé personnalisé</label>
        </div>
        <div class="fr-col-3 fr-p-2v">
          <label class="fr-text--bold"> Valeur Type :</label>
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
      <DsfrButton>
        Mettre à jour
      </DsfrButton>
    </form>
  </div>
</template>
