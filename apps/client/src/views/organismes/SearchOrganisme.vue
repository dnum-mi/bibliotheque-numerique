<script lang="ts" setup>
import { computed, onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  isRnfLuhnValid,
  foundationTypeWithoutUnknown,
} from '@biblio-num/shared'

import type {
  IBasicOrganisme,
  ILastConsultedOrganisme,
  ISearchHubInput,
} from '@biblio-num/shared'

import apiClient from '@/api/api-client.ts'
import useToaster from '@/composables/use-toaster.ts'
import { routeNames } from '@/router/route-names.ts'
import { vMaska } from 'maska/vue'
import type { MaskInputOptions, MaskaDetail } from 'maska'
import SearchOrganismeInput from './search/SearchOrganismeInput.vue'

const toaster = useToaster()
const router = useRouter()

// DsfrTable is ($*&#% and won't take all of width. So we force title to be "too big" with spaces, so that the table take entire available width.
const LOTS_OF_SPACE = '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'

//#region 📍------ État général ------ 📍
const headers = [
  'Numéro RNA / RNF',
  'Type',
  'Titre',
  'État',
  'Code postal - Ville',
]

const searchMode = ref<'fulltext' | 'id'>('id')

const results = ref<IBasicOrganisme[]>([])
const recentResults = ref<ILastConsultedOrganisme[]>([])

const isLoading = ref(false)
const hasSearched = ref(false)

// Erreur spécifique à la recherche par identifiant
const hasIdError = ref(false)
const idErrorValue = ref<string>('')
//#endregion

//#region 📍------ Recherche par identifiant ------ 📍
const idSearchType = ref<'rnf' | 'rna'>('rnf')

// RNA : un champ simple, avec W obligatoire
const rnaId = ref('W')

// refs pour auto-focus
// RNF complet (affichage + utilisation)
const fullRnf = computed(() => {
  if (inputRnfError.value) {
    return ''
  }

  return rnfId.value
})

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
//#endregion

//#region 📍------ Récents & plein texte ------ 📍
const loadRecent = async () => {
  try {
    recentResults.value = await apiClient.getLastConsultedOrganisme()
  } catch {
    recentResults.value = []
  }
}

const onSearchFullText = async (searchInput: ISearchHubInput) => {
  const query = searchInput
  if (!query) {
    return
  }

  isLoading.value = true
  hasIdError.value = false
  results.value = []

  try {
    const response = await apiClient.searchOrganisme(query)
    results.value = response
    hasSearched.value = true
  } catch {
    results.value = []
    hasSearched.value = false
    toaster.addErrorMessage('La recherche est momentanément indisponible. Veuillez réessayer plus tard.')
  } finally {
    isLoading.value = false
  }
}

const searchTextInput = useTemplateRef('search-text')

// reset quand champ plein texte vidé
const resetFullTextSearch = () => {
  searchTextInput.value?.reset()
  results.value = []
  hasSearched.value = false
}

const resetFullTextAndRecents = () => {
  resetFullTextSearch()
  void loadRecent()
}

//#endregion

//#region 📍------ Reset ID & modes ------ 📍
const resetIdSearch = () => {
  hasIdError.value = false
  idErrorValue.value = ''
  rnaId.value = 'W'
  rnfId.value = ''
}

const resetAll = () => {
  resetFullTextSearch()
  resetIdSearch()
  isLoading.value = false
  void loadRecent()
}

const setModeFulltext = () => {
  searchMode.value = 'fulltext'
  resetAll()
}

const setModeId = () => {
  searchMode.value = 'id'
  resetAll()
}
//#endregion

//#region 📍------ Navigation fiche organisme ------ 📍
const navigateToDetails = async (id: string) => {
  isLoading.value = true

  await router.push({
    name: routeNames.FICHE_ORGANISME,
    params: { id },
  })
  isLoading.value = false
}
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
        return `###-${type}-#####-##`
      }
    }
    return '###-@@@@-#####-##'
  },
  tokens: {
    '#': { pattern: /\d/ },
    '@': { pattern: /[A-Z]/ },
  },
  eager: true,
  uppercase: true,

})//#endregion

//#region 📍------ Table : résultats ou récents ------ 📍
const sourceList = computed(() => (hasSearched.value ? results.value : recentResults.value))

const rows = computed(() => {
  if (!sourceList.value?.length) {
    return []
  }

  return sourceList.value.map((result: IBasicOrganisme) => {
    return {
      rowAttrs: {
        class: 'bn-search-row',
        onClick: () => navigateToDetails(result.id),
      },
      // on laisse le DSFR gérer le rendu, mais la ligne entière sera cliquable côté template
      rowData: [
        result.id,
        {
          component: 'OrganismeBadge',
          type: result.type,
        },
        result.title + LOTS_OF_SPACE,
        result.state,
        `${result.postalCode} - ${result.city}`,
      ],
    }
  })
})
//#endregion

onMounted(async () => {
  resetIdSearch()
  await loadRecent()
})
</script>

<template>
  <LayoutList
    title="Rechercher dans le référentiel des associations et des fondations"
    title-bg-color="var(--border-plain-grey)"
    title-icon="fr-icon-search-line"
  >
    <div class="p-8 max-w-5xl mx-auto">
      <!-- Sélecteur de mode -->
      <div class="bn-search-modes fr-mb-4w">
        <button
          type="button"
          class="bn-search-mode"
          :class="{ 'bn-search-mode--active': searchMode === 'id' }"
          @click="setModeId"
        >
          Recherche par identifiant
        </button>

        <button
          type="button"
          class="bn-search-mode"
          :class="{ 'bn-search-mode--active': searchMode === 'fulltext' }"
          @click="setModeFulltext"
        >
          Recherche plein texte
        </button>
      </div>

      <!-- MODE 1 : PLEIN TEXTE -->
      <section
        v-if="searchMode === 'fulltext'"
        class="bn-id-section"
      >
        <SearchOrganismeInput
          ref="search-text"
          :is-loading="isLoading"
          @search="onSearchFullText"
        />
      </section>

      <!-- MODE 2 : IDENTIFIANT -->
      <section
        v-else
        class="bn-id-section"
      >
        <p class="fr-text--sm fr-mb-2w text-grey-700">
          Rechercher directement un organisme par son identifiant RNF ou RNA.
          <br>Pour les RNF, la saisie est guidée (département, type de fondation, numéro, clé de contrôle).
        </p>

        <!-- Choix RNF / RNA -->
        <div class="flex flex-wrap items-center gap-3 fr-mb-3w">
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
          v-else
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
      </section>

      <!-- Séparateur -->
      <hr
        v-if="!hasIdError"
        class="fr-mt-2w"
      >

      <!-- Résultats / récents / erreur ID -->
      <section>
        <!-- Erreur sur recherche par identifiant -->
        <template v-if="hasIdError">
          <div class="flex w-full justify-around text-center mt-5">
            <div class="flex flex-col items-center">
              <VIcon
                scale="5"
                animation="pulse"
                speed="slow"
                color="red"
                name="ri-search-2-line"
              />
              <p class="m-0">
                <strong>{{ idErrorValue }}</strong>
              </p>
              <p>Impossible de trouver cet organisme.</p>
            </div>
          </div>
        </template>

        <!-- Loading général (plein texte ou navigation) -->
        <template v-else>
          <div
            v-if="isLoading"
            class="fr-my-4w py-8 text-center"
            role="status"
            aria-live="polite"
          >
            <VIcon
              scale="3"
              name="ri-refresh-line"
              animation="spin"
              aria-hidden="true"
            />
            <p class="text-center fr-text--md fr-mt-2w text-grey-500">
              Recherche en cours...
            </p>
          </div>

          <template v-else>
            <div v-if="rows.length" class="bn-table-wrap">
              <DsfrTable
                :title="hasSearched ? 'Résultats de la recherche' : 'Derniers organismes consultés' "
                :headers="headers"
                :rows="rows"
              />
            </div>
            <div
              v-else-if="hasSearched"
              class="fr-mt-4w flex flex-col items-center text-center py-8"
              role="status"
              aria-live="polite"
            >
              <div class="mb-4 p-4 bg-white rounded-full">
                <span
                  class="fr-icon-search-line fr-icon--xl"
                  aria-hidden="true"
                />
              </div>

              <h3 class="fr-h5 fr-mb-1w">
                Aucun résultat trouvé
              </h3>
              <p class="text-grey-600 fr-mb-2w max-w-md">
                Nous n'avons trouvé aucun organisme correspondant à cette recherche.
              </p>

              <DsfrButton
                label="Effacer la recherche"
                tertiary
                no-outline
                icon="fr-icon-close-circle-line"
                @click="resetFullTextAndRecents"
              />
            </div>
          </template>
        </template>
      </section>
    </div>
  </LayoutList>
</template>

<style scoped>
/* ============================= */
/* LIGNES CLIQUABLES (TABLE)     */
/* ============================= */

:deep(.bn-search-row) {
  cursor: pointer;
}

:deep(.bn-search-row:hover) {
  background-color: var(--background-action-low-blue-france);
}

/* ============================= */
/* UI EXISTANTE                  */
/* ============================= */

.bn-search-modes {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.bn-search-mode {
  border-radius: 9999px;
  border: 1px solid var(--border-default-grey);
  padding: 0.4rem 0.9rem;
  font-size: 0.875rem;
  background-color: white;
  cursor: pointer;
}

.bn-search-mode--active {
  background-color: var(--background-contrast-blue-france);
  border-color: var(--border-action-high-blue-france);
  color: var(--border-action-high-blue-france);
}

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

.bn-id-section {
  border-radius: 0.5rem;
  border: 1px solid var(--border-default-grey);
  padding: 1.5rem;
  background-color: var(--background-alt-grey);
}

.bn-rnf-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

@media (max-width: 900px) {
  .bn-rnf-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.color-blue-france {
  color: var(--background-action-high-blue-france);
}
</style>
