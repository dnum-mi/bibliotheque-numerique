<script lang="ts" setup>
import { useRnfStore } from '@/stores/rnf-store'
import useRnfClient from '../composables/use-rnf-client.js'
import { useField, useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'

import { deepGet } from '@/utils'
import type { CurrentFoundationOutputDto, FoundationOutputDto } from '@/composables/use-rnf-client'

const rnfStore = useRnfStore()
const router = useRouter()

const dossierInputLabel = 'N° de dossier Démarches simplifées'
const emailInputLabel = 'Courriel utilisé dans Démarches Simplifiées'
const dossierInputPlaceholder = '456735'
const emailInputPlaceholder = 'instructeur@ds-gouv.fr'

const dictFoundation = {
  rnfId: 'ID RNF',
  type: 'Type de structure',
  department: 'Département du siège social',
  phone: 'Téléphone',
  email: 'Courriel du déclarant',
  'address.label': 'Adresse du siège social',
  status: 'Statuts',
} as const
const { rnfId, ...dictCurrentFoundation } = dictFoundation

const [DefineTemplate, ReuseTemplate] = createReusableTemplate<{
  foundation: CurrentFoundationOutputDto | FoundationOutputDto
  dictionnaire: typeof dictFoundation | typeof dictCurrentFoundation
}>()

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

const { handleSubmit, handleReset } = useForm({
  validationSchema,
})

const { value: instructeurEmail, errorMessage: emailError } = useField<string>('email')
const { value: dossierId, errorMessage: dossierIdError } = useField<string>('dossierId')

const onSubmit = handleSubmit(async (values) => {
  alertProps.description = ''
  await getRnfId(false)
})

const rnfClient = useRnfClient()

const alertProps = reactive({
  title: '',
  description: '',
  type: 'info',
})

async function getRnfId(force: boolean) {
  await rnfClient.getRnfId(+dossierId.value, instructeurEmail.value, force)
  rnfStore.dossierId = dossierId.value
  rnfStore.demarcheId = rnfClient.ds.value?.demarcheId?.toString() ?? ''

  if (!force) {
    if (rnfClient.collisions.length) {
      return
    }
    if (rnfClient.errorMessage.value) {
      alertProps.description = rnfClient.errorMessage.value
      alertProps.type = 'error'
      alertProps.title = 'Impossible de créer l’identifiant'
      return
    }
  }

  alertProps.description = `Le numéro RNF correspondant au dossier ${dossierId.value} a été créé !`
  alertProps.type = 'success'
  alertProps.title = rnfClient.rnfId.value

  rnfStore.rnfId = rnfClient.rnfId.value
  rnfStore.created = true
  router.push({ name: 'RnfCreated' })
}

const selectedFoundation = ref('')
const currentFoundation = computed(() => rnfClient.currentFoundation.value)

const messageFoundation = computed(() =>
  selectedFoundation.value ? 'Une structure RNF a déjà été créée' : 'Aucune structure ne correspond',
)
const resetSelectedFoundation = () => {
  selectedFoundation.value = ''
}

const onclick = async () => {
  if (selectedFoundation.value) {
    rnfStore.rnfId = selectedFoundation.value
    rnfStore.created = false
    router.push({ name: 'RnfCreated' })
    return
  }
  await getRnfId(true)
}
const createProps = {
  label: 'Créer un ID RNF',
  class: 'btn-create',
}

const rejectProps = {
  label: 'Rejeter la demande',
  class: 'btn-reject',
}
const buttonProps = computed(() => (selectedFoundation.value ? rejectProps : createProps))
</script>

<template>
  <DefineTemplate v-slot="{ foundation, dictionnaire }">
    <div
      v-for="(value, prop) in dictionnaire"
      :key="prop"
      class="fr-pl-4w"
    >
      <h5 class="fr-text--md fr-my-1v">{{ value }}</h5>
      <template v-if="typeof deepGet(foundation, prop, '') != 'object'">
        <p class="break-word">{{ deepGet(foundation, prop, '') }}</p>
      </template>
      <template v-else>
        <p class="break-word">
          <a
            download
            :href="deepGet(foundation, prop, '').fileUrl || `/api/files/${deepGet(foundation, prop, '').uuid}`"
            target="_blank"
          >
            Voir les statuts
          </a>
        </p>
      </template>
    </div>
  </DefineTemplate>

  <div class="h-[250px]">
    <div class="h-full flex flex-col">
      <div
        v-if="rnfClient.collisions.length === 0"
        class="text-center"
      >
        <p v-if="rnfClient.requesting.value">Requête en cours, veuillez patienter...</p>
        <DsfrAlert
          v-if="alertProps.description"
          v-bind="alertProps"
        />
      </div>
      <form
        class="flex flex-col items-center rnf-content"
        @submit.prevent="onSubmit($event)"
      >
        <DsfrInputGroup
          label-visible
          :error-message="dossierIdError || emailError"
        >
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

        <div class="flex flex-row">
          <p class="text-center">
            <span class="fr-link fr-mx-4v inline-block"
              ><a
                href="#"
                data-testid="reset-btn"
                @click.prevent="handleReset()"
                >Effacer</a
              ></span
            >
            <DsfrButton
              type="submit"
              label="Rechercher"
            />
          </p>
        </div>
      </form>
      <div
        v-if="rnfClient.collisions.length"
        class="fr-pt-4w"
      >
        <div class="fr-container">
          <div class="fr-grid-row">
            <div
              class="fr-col-3 cursor-pointer"
              @click="resetSelectedFoundation()"
            >
              <h6 class="text-center">Demande d’inscription au RNF</h6>
              <p class="fr-text--bold">
                <span class="bullet fr-mr-2v fr-ml-n2v"
                  ><span
                    class="fr-icon-bank-line"
                    aria-hidden="true"
                  ></span></span
                >{{ currentFoundation.title }}
              </p>
              <ReuseTemplate
                :foundation="currentFoundation"
                :dictionnaire="dictCurrentFoundation"
              />
            </div>
            <div class="fr-col-9">
              <h6 class="text-center">Sélectionner la structure identique ou créer un nouvel ID</h6>
              <div class="collisions">
                <div
                  v-for="foundation of rnfClient.collisions"
                  :key="foundation.id"
                  class="fr-card collision"
                  :class="{ 'orange-border': foundation.dissolvedAt }"
                >
                  <DsfrRadioButton
                    v-model="selectedFoundation"
                    :label="foundation.title"
                    name="collisions"
                    :value="foundation.rnfId"
                  />
                  <br />
                  <div
                    v-if="foundation.dissolvedAt"
                    class="orange-text"
                  >
                    Dissoute le {{ new Date(foundation.dissolvedAt).toLocaleDateString('fr-FR') }}
                  </div>
                  <br />
                  <ReuseTemplate
                    :foundation="foundation"
                    :dictionnaire="dictFoundation"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer class="footer">
          <div class="fr-mr-2v">
            {{ messageFoundation }}
          </div>
          <DsfrButton
            data-testid="create-btn"
            v-bind="buttonProps"
            @click="onclick"
          />
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-center {
  text-align: center;
}

.h-\[250px\] {
  height: 250px;
}

.inline-block {
  display: inline-block;
}

.collisions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1em;
  margin-block: 2rem;
}

.collision {
  padding: 1rem;
}

.collision :deep(.fr-radio-group > .fr-label) {
  font-weight: bold;
}

.footer {
  position: fixed;
  bottom: 0;
  background-color: white;
  height: 4rem;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 -0.1em 0.4em var(--grey-50-1000);
  width: 100%;
}

.bullet {
  background-color: var(--border-plain-info);
  color: white;
  padding: 0.25rem;
  padding-top: 0.125rem;
  border-radius: 50%;
}

.orange-border {
  border: 1px solid orange !important;
  box-shadow: none !important;
}

.orange-text {
  color: orange;
  font-weight: bold;
}

.cursor-pointer {
  cursor: pointer;
}

.btn-create {
  background-color: var(--background-action-high-blue-france);
}

.btn-reject {
  background-color: var(--background-flat-error);
}
</style>
