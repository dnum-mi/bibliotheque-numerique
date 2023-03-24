<script lang="ts" setup>
import { computed } from 'vue'
import DemarcheConfiguration from '@/views/DemarcheConfiguration.vue'
import { useDemarcheStore } from '@/stores'
import { useForm } from 'vee-validate'

const props = withDefaults(defineProps<{
    dataJson?: object
  }>(), {
  dataJson: () => ({}),
})
const title = 'La configuration'

const demarcheStore = useDemarcheStore()
const demarcheConfigurations = computed<any[]>(() => demarcheStore.demarcheConfigurations)

const { handleSubmit } = useForm()

const submit = handleSubmit(async () => {
  try {
    await demarcheStore.updateDemarcheConfigurations(demarcheConfigurations)
  } catch (e) {
    console.log('Update demarche configurations Error')
  }
})

</script>

<template>
  <div class="fr-container">
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
