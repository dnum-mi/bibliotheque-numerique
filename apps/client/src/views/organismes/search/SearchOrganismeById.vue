<script lang="ts" setup>
import { computed, ref, reactive } from 'vue'
import { vMaska } from 'maska/vue'
import type { MaskInputOptions, MaskaDetail } from 'maska'

import {
  isRnfLuhnValid,
  foundationTypeWithoutUnknown,
} from '@biblio-num/shared'
import useToaster from '@/composables/use-toaster'
import SubLayoutSearch from './SubLayoutSearch.vue'
import { routeNames } from '@/router/route-names'
import { IS_ASSOCIATIONS_ENABLED } from '@/config'

const isLoading = ref(false)

const router = useRouter()
const toaster = useToaster()

const rnaId = ref('W')

const fullRnf = computed(() => {
  if (inputRnfError.value) {
    return ''
  }

  return rnfId.value
})

//#region 📍------ Recherche par identifiant ------ 📍
const idSearchType = ref<'rnf' | 'rna'>('rnf')

//#region 📍------ Auto-tab RNF ------ 📍
const rnfId = ref('') // champ caché pour v-model et validation globale du RNF
const isInputRnfInvalid = computed(() => !!rnfId.value && !isRnfLuhnValid(rnfId.value))
const inputRnfError = computed(() => {
  if (isInputRnfInvalid.value) {
    return 'Le numéro RNF saisi est invalide.'
  }
  return ''
})
const maskOptions = reactive<MaskInputOptions>({
  preProcess: (value: string) => {
    const upper = value.toUpperCase()
    return upper
  },
  onMaska (detail: MaskaDetail) {
    if (detail.completed) {
      rnfId.value = detail.masked
    } else {
      rnfId.value = ''
    }
  },
  mask: (value: string): string => {
    const upper = value.toUpperCase()
    for (const type of foundationTypeWithoutUnknown) {
      if (upper.includes(type)) {
        return `##$-${type}-#####-##`
      }
    }
    return '##$-@@@@-#####-##'
  },
  tokens: {
    '#': { pattern: /\d/ },
    '$': { pattern: /[0-9AB]/ },
    '@': { pattern: /[A-Z]/ },
  },
  eager: true,
  // @ts-ignore TODO: corriger le type
  uppercase: true,

})
//#endregion

//#region 📍------ RNA : W obligatoire ------ 📍
const onRnaInput = () => {
  if (!rnaId.value) {
    rnaId.value = 'W'
    return
  }
  if (!rnaId.value.startsWith('W')) {
    rnaId.value = `W${rnaId.value.replace(/W/g, '')}`
  }
}
//#endregion

const onIdSearch = async () => {
  if (idSearchType.value === 'rnf') {
    if (!fullRnf.value) {
      toaster.addErrorMessage('Merci de compléter tous les champs du numéro RNF.')
      return
    }
    await navigateToDetails(fullRnf.value)
  } else {
    const id = rnaId.value.trim()
    if (!id) {
      toaster.addErrorMessage('Merci de saisir un numéro RNA.')
      return
    }
    await navigateToDetails(id)
  }
}

const navigateToDetails = async (id: string) => {
  isLoading.value = true

  await router.push({
    name: routeNames.FICHE_ORGANISME,
    params: { id },
  })
  isLoading.value = false
}

const caption = computed(() => {
  if (IS_ASSOCIATIONS_ENABLED) {
    return `Rechercher directement un organisme par son identifiant RNF ou RNA. \nPour les RNF, la saisie est guidée (département, type de fondation, numéro, clé de contrôle).`
  }
  return `Rechercher directement une fondation par son identifiant RNF. \nLa saisie est guidée (département, type de fondation, numéro, clé de contrôle).`
})
</script>>

<template>
  <SubLayoutSearch :is-loading="isLoading" :has-error="false">
    <template #section-search>
      <p class="fr-text--sm fr-mb-2w text-grey-700 bn-caption-text">
        {{ caption }}
      </p>

      <form @submit.prevent="onIdSearch">
        <!-- Choix RNF / RNA -->
        <div v-if="IS_ASSOCIATIONS_ENABLED" class="flex flex-wrap items-center gap-3 fr-mb-3w">
          <p class="fr-text--sm text-grey-700 fr-mb-0 flex items-center">
            <strong>Type d’identifiant</strong> :
          </p>
          <button
            type="button"
            class="bn-scope-pill"
            :class="{ 'bn-scope-pill--active': idSearchType === 'rnf' }"
            @click="idSearchType = 'rnf'"
          >
            RNF
          </button>
          <button
            type="button"
            class="bn-scope-pill"
            :class="{ 'bn-scope-pill--active': idSearchType === 'rna' }"
            @click="idSearchType = 'rna'"
          >
            RNA
          </button>
        </div>

        <!-- Saisie RNF -->
        <div
          v-if="idSearchType === 'rnf'"
          class="fr-mb-2w"
        >
          <label
            for="id-input-rnf"
            class="fr-label"
          >
            Numéro RNF
          </label>
          <input
            id="id-input-rnf"
            v-maska="maskOptions"
            class="fr-input"
            placeholder="ex : 075-FRUP-12345-42"
            :aria-invalid="isInputRnfInvalid"
            :aria-errormessage="isInputRnfInvalid ? 'id-input-rnf-error-message' : ''"
            :aria-describedby="isInputRnfInvalid ? 'id-input-rnf-error-message' : ''"
            required
            aria-required="true"
          >
          <p
            v-if="isInputRnfInvalid"
            id="id-input-rnf-error-message"
            class="fr-text--sm fr-error-text"
            role="alert"
          >
            {{ inputRnfError }}
          </p>
        </div>

        <!-- Saisie RNA -->
        <div
          v-else-if="IS_ASSOCIATIONS_ENABLED && idSearchType === 'rna'"
          class="fr-mb-3w max-w-xs"
        >
          <label class="fr-label">
            Numéro RNA
            <span class="fr-hint-text">ex : W123456789</span>
          </label>
          <input
            v-model="rnaId"
            class="fr-input"
            placeholder="ex : W123456789"
            @input="onRnaInput"
          >
        </div>

        <div class="flex flex-wrap items-center gap-5">
          <DsfrButton
            label="Rechercher cet organisme"
            icon="fr-icon-search-line"
            :disabled="isLoading"

            @click="onIdSearch"
          />
          <!-- Aperçu RNF complet -->
          <p
            v-if="idSearchType === 'rnf' && fullRnf"
            class="fr-text--sm text-grey-700 fr-mb-0 flex items-center"
          >
            Numéro RNF complet :
            <strong>{{ fullRnf || '—' }}</strong>
          </p>
        </div>
      </form>
    </template>
  </SubLayoutSearch>
</template>

<style lang="css" scoped>
.bn-scope-pill {
  border-radius: 9999px;
  border: 1px solid var(--border-default-grey);
  padding: 0.25rem 0.8rem;
  font-size: 0.8rem;
  background-color: white;
  cursor: pointer;
}

.bn-scope-pill--active {
  background-color: var(--background-action-low-blue-france);
  border-color: var(--border-action-high-blue-france);
  color: var(--text-title-blue-france);
}

.bn-caption-text {
  white-space: pre-line;
}
</style>
