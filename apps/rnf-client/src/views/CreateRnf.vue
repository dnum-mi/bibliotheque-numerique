<script lang="ts" setup>
import { reactive } from 'vue'
import useRnfClient from '../composables/use-rnf-client.js'
import { useField, useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'

const dossierInputLabel = 'Veuillez indiquer un numéro de dossier'
const emailInputLabel = "Veuillez indiquer votre email d'instructeur"
const dossierInputPlaceholder = '456735'
const emailInputPlaceholder = 'instructeur@ds-gouv.fr'

const validationSchema = toTypedSchema(
  z.object({
    dossierId: z
      .string()
      .nonempty('Veuillez saisir le numéro de dossier')
      .refine((value) => Number(value), {
        message: 'Le numéro de dossier ne doit être composé que de chiffres',
      }),
    email: z.string().nonempty('Veuillez saisir une adresse courriel').email('L’adresse courriel ne semble pas valide'),
  }),
)

const { handleSubmit } = useForm({
  validationSchema,
})

const { value: instructeurEmail, errorMessage: emailError } = useField<string>('email')
const { value: dossierId, errorMessage: dossierIdError } = useField<string>('dossierId')

const onSubmit = handleSubmit(async (values) => {
  alertProps.description = ''
  await getRnfId()
})

const rnfClient = useRnfClient()

const alertProps = reactive({
  title: '',
  description: '',
  type: 'info',
})

async function getRnfId() {
  await rnfClient.getRnfId(+dossierId.value, instructeurEmail.value)
  if (rnfClient.errorMessage.value) {
    alertProps.description = rnfClient.errorMessage.value
    alertProps.type = 'error'
    alertProps.title = 'Impossible de créer l’identifiant'
    return
  }
  alertProps.description = `Le numéro RNF correspondant au dossier ${dossierId.value} a été créé !`
  alertProps.type = 'success'
  alertProps.title = rnfClient.rnfId.value
}
</script>

<template>
  <div class="fr-container h-[250px]">
    <div class="h-full">
      <form class="rnf-request" @submit.prevent="onSubmit($event)">
        <div>
          <DsfrInputGroup label-visible :error-message="dossierIdError || emailError">
            <p>
              <DsfrInput
                v-model="dossierId"
                autofocus
                type="text"
                :label="dossierInputLabel"
                label-visible
                :placeholder="dossierInputPlaceholder"
              />
            </p>
            <p>
              <DsfrInput
                v-model="instructeurEmail"
                type="email"
                :label="emailInputLabel"
                label-visible
                :placeholder="emailInputPlaceholder"
              />
            </p>
          </DsfrInputGroup>

          <p class="text-center">
            <DsfrButton type="submit" label="Envoyer" />
          </p>
        </div>
      </form>
      <div class="text-center">
        <p v-if="rnfClient.requesting.value">Requête en cours, veuillez patienter...</p>
        <DsfrAlert v-if="alertProps.description" v-bind="alertProps" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.rnf-request {
  display: flex;
  height: 100%;
  justify-content: center;
  margin-top: 4rem;
}

.text-center {
  text-align: center;
}

.h-\[250px\] {
  height: 250px;
}
</style>
