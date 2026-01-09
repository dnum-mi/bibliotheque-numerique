<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type {
  IBasicOrganisme,
  ILastConsultedOrganisme,
} from '@biblio-num/shared'
import apiClient from '@/api/api-client.ts'
import useToaster from '@/composables/use-toaster.ts'
import { routeNames } from '@/router/route-names.ts'

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

const inputSearch = ref('')
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

// RNF : 075-FRUP-12345-42
const rnfDept = ref('')
const rnfType = ref<'FRUP' | 'FDD' | 'FE' | ''>('')
const rnfNumber = ref('')
const rnfLuhn = ref('')

// pour éviter d’écraser ce que tape l’utilisateur dans le Luhn
const rnfLuhnDirty = ref(false)

// RNA : un champ simple, avec W obligatoire
const rnaId = ref('W')

// refs pour auto-focus
const rnfDeptRef = useTemplateRef('rnfDeptRef')
const rnfTypeSelectRef = useTemplateRef('rnfTypeSelectRef')
const rnfNumberRef = useTemplateRef('rnfNumberRef')
const rnfLuhnRef = useTemplateRef('rnfLuhnRef')

// RNF complet (affichage + utilisation)
const fullRnf = computed(() => {
  if (!rnfDept.value || !rnfType.value || !rnfNumber.value) {
    return ''
  }
  const base = `${rnfDept.value}-${rnfType.value}-${rnfNumber.value}`

  return rnfLuhn.value ? `${base}-${rnfLuhn.value}` : base
})

const onRnfPaste = (event: ClipboardEvent) => {
  const text = event.clipboardData?.getData('text')?.trim() ?? ''
  if (!text) { return }

  // On accepte : 092-FDD-00109-05, 092FDD00109-05, 092FDD00109 05
  const normalized = text.replace(/\s+/g, '')
  const match = normalized.match(
    /^(\d{3})-?(FRUP|FDD|FE)-?(\d{1,6})-?(\d{2})$/i,
  )
  if (!match) {
    return
  }

  event.preventDefault()

  const [, dept, type, num, luhn] = match
  rnfDept.value = dept || ''
  rnfType.value = type?.toUpperCase() as 'FRUP' | 'FDD' | 'FE'
  rnfNumber.value = num || ''
  rnfLuhn.value = luhn || ''
  rnfLuhnDirty.value = true // on ne recalcule plus par-dessus un RNF "copié collé"

  // focus sur la clé
  rnfLuhnRef.value?.focus()
}

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

const onSearchFullText = async () => {
  const query = inputSearch.value.trim()
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

// reset quand champ plein texte vidé
const resetFullTextSearch = () => {
  inputSearch.value = ''
  results.value = []
  hasSearched.value = false
}

const resetFullTextAndRecents = () => {
  resetFullTextSearch()
  void loadRecent()
}

const handleInputChange = (value: string | number | undefined) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    resetFullTextAndRecents()
  }
}
//#endregion

//#region 📍------ Reset ID & modes ------ 📍
const resetIdSearch = () => {
  hasIdError.value = false
  idErrorValue.value = ''
  rnfDept.value = ''
  rnfType.value = ''
  rnfNumber.value = ''
  rnfLuhn.value = ''
  rnfLuhnDirty.value = false
  rnaId.value = 'W'
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
const onDeptInput = () => {
  if (rnfDept.value.length >= 3) {
    rnfTypeSelectRef.value?.focus()
  }
}

// pour le type, on laisse l'utilisateur cliquer / taber

const onNumberInput = () => {
  if (rnfNumber.value.length >= 5) {
    // on recalcule le Luhn automatiquement
    rnfLuhnDirty.value = false
    if (fullRnf.value) {
      rnfLuhnRef.value?.focus()
    }
  }
}

const onLuhnInput = () => {
  rnfLuhnDirty.value = true
}
//#endregion

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
        <p class="fr-text--sm fr-mb-2w text-grey-700">
          Rechercher un titre, une description, un bénéficiaire effectif ou une adresse à travers cette recherche plein texte.
        </p>

        <form @submit.prevent="onSearchFullText">
          <DsfrSearchBar
            v-model="inputSearch"
            label="Rechercher un numéro, un titre, une description..."
            :disabled="isLoading"
            @update:model-value="handleInputChange"
            @search="onSearchFullText"
          />
        </form>
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
          class="bn-rnf-grid fr-mb-2w"
        >
          <div>
            <label class="fr-label">
              Département
              <span class="fr-hint-text">ex : 075, 057</span>
            </label>
            <input
              ref="rnfDeptRef"
              v-model="rnfDept"
              maxlength="3"
              class="fr-input"
              inputmode="numeric"
              @input="onDeptInput"
              @paste="onRnfPaste"
            >
          </div>

          <div>
            <label class="fr-label">
              Type
              <span class="fr-hint-text">FRUP, FDD, FE</span>
            </label>
            <select
              ref="rnfTypeSelectRef"
              v-model="rnfType"
              class="fr-input"
            >
              <option value="">
                Sélectionner
              </option>
              <option value="FRUP">
                FRUP
              </option>
              <option value="FDD">
                FDD
              </option>
              <option value="FE">
                FE
              </option>
            </select>
          </div>

          <div>
            <label class="fr-label">
              Numéro
              <span class="fr-hint-text">5 chiffres</span>
            </label>
            <input
              ref="rnfNumberRef"
              v-model="rnfNumber"
              maxlength="5"
              class="fr-input"
              inputmode="numeric"
              @input="onNumberInput"
            >
          </div>

          <div>
            <label class="fr-label flex items-center gap-1">
              <div class="flex gap-2 items-center">
                Clé (Luhn)
                <DsfrTooltip
                  content="Le luhn est généré automatiquement à partir du numéro. Si le Luhn ne correspond pas, vous avez probablement fait une erreur dans la copie du numéro."
                  on-hover
                >
                  <span class="fr-icon-information-line fr-icon--sm color-blue-france" />
                </DsfrTooltip>
              </div>
              <span class="fr-hint-text">Automatique & modifiable</span>
            </label>

            <input
              ref="rnfLuhnRef"
              v-model="rnfLuhn"
              maxlength="2"
              class="fr-input"
              inputmode="numeric"
              @input="onLuhnInput"
            >
          </div>
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
