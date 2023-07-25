<template>
  <LayoutAccueil>
    <div class="fr-container fr-m-5w">
      <div
        class="fr-container fr-grid-row"
      >
        <div class="fr-col-1" />
        <div class="fr-col-10">
          <h5
            class="mb-20 fr-text-title--blue-france"
            style="text-align:center"
          >
            Réinistialisation du mot de passe
          </h5>
          <form
            class="card"
            @submit.prevent="onSubmit"
          >
            <DsfrInputGroup
              :is-valid="emailError"
              :error-message="emailError"
            >
              <DsfrInput
                id="email"
                v-model="emailValue"
                label="Courriel"
                label-visible
                placeholder="louis.dubois@interieur.gouv.fr"
                type="email"
              >
                <template #required-tip>
                  <em class="required-label"> *</em>
                </template>
              </DsfrInput>
            </DsfrInputGroup>
            <div
              class="fr-m-4w"
              style="text-align:center"
            >
              <DsfrButton type="submit">
                Envoyer
              </DsfrButton>
            </div>
          </form>
          <DsfrAlert
            :title="alertTitle"
            :description="alertDescription"
            type="info"
            :closed="!openAlert"
            closeable
            @close="closeAlert()"
          />
        </div>
      </div>
    </div>
  </LayoutAccueil>
</template>

<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import { z } from 'zod'
import type { ResetPasswordInputDto } from '@biblio-num/shared'
import { resetPassword } from '@/shared/services/user.service'
import { ref } from 'vue'

const validationSchema = toTypedSchema(z.object({
  email: z.string({ required_error: 'Veuillez saisir votre adresse courriel' }).nonempty('Veuillez saisir votre adresse courriel').email('L’adresse courriel ne semble pas valide'),
}))

const { handleSubmit, handleReset } = useForm({
  validationSchema,
})

const { value: emailValue, errorMessage: emailError } = useField<string>('email')
const alertTitle = ref('')
const alertDescription = ref('')
const openAlert = ref(false)

const onSubmit = handleSubmit(async (formValue : ResetPasswordInputDto) => {
  await resetPassword(formValue)
  openAlert.value = true
  alertDescription.value = 'Votre demande a été prise en compte. Vous recevrez un courriel pour modifier votre mot de passe.'
})

const closeAlert = () => {
  openAlert.value = false
}
</script>
