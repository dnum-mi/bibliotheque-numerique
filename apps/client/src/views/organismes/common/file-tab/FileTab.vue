<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type {
  organismeCategoryKey,
  IFile,
  TypeFileKey,
} from '@biblio-num/shared'
import FileCard from './FileCard.vue'
import {
  getFileTypeStyle,
  sortTypesByImportance,
} from '@/views/organismes/common/file-tab/file-type-style.const.ts'

type SortOrder = 'asc' | 'desc'

const props = withDefaults(
  defineProps<{
    organismeType:
    organismeCategoryKey
    organismeId: string,

    files: IFile[]
    initialSort?: SortOrder
  }>(),
  { initialSort: 'desc' },
)

const emit = defineEmits<{
  (e: 'open', file: IFile): void
  (e: 'update:typeFilter', v: TypeFileKey[] | 'ALL'): void
  (e: 'update:sortOrder', v: SortOrder): void
}>()

const sortOrder = ref<SortOrder>(props.initialSort)
watch(sortOrder, (v) => emit('update:sortOrder', v))

/** ✅ Type = selection exclusive (0 ou 1 type) */
const selectedType = ref<TypeFileKey | 'ALL'>('ALL')
watch(selectedType, (v) => emit('update:typeFilter', v === 'ALL' ? 'ALL' : [v]))

/** ✅ filtre nom */
const nameQuery = ref('')

function getDateMs (file: IFile): number {
  const raw = file.effectiveAt ?? file.uploadedAt ?? file.createdAt
  const d = new Date(raw)
  const t = d.getTime()
  return Number.isNaN(t) ? 0 : t
}

const availableTypes = computed(() => {
  const set = new Set<TypeFileKey>()
  for (const f of props.files) { set.add(f.typeFile || 'Autre') }
  return sortTypesByImportance(Array.from(set))
})

/** ---- utils filtre nom (accent-insensitive + case-insensitive + regex-safe) ---- */
function stripDiacritics (s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036F]/g, '')
}

const safeRegex = computed<RegExp | null>(() => {
  const q = nameQuery.value.trim()
  if (!q) {
    return null
  }
  try {
    // regex sur une version normalisée (sans accents)
    return new RegExp(stripDiacritics(q), 'i')
  } catch {
    // si l'user tape une regex invalide -> on retombe sur un "includes"
    return null
  }
})

function matchesName (fileName: string): boolean {
  const q = nameQuery.value.trim()
  if (!q) {
    return true
  }

  const hay = stripDiacritics(fileName).toLowerCase()
  const needle = stripDiacritics(q).toLowerCase()

  const rx = safeRegex.value
  return rx ? rx.test(hay) : hay.includes(needle)
}

const displayed = computed(() => {
  // 1) filtre type (exclusif)
  const byType = selectedType.value === 'ALL' ? props.files : props.files.filter((f) => (f.typeFile || 'Autre') === selectedType.value)

  // 2) filtre nom
  const byName = byType.filter((f) => matchesName(f.name ?? ''))

  // 3) tri date
  return [...byName].sort((a, b) => {
    const diff = getDateMs(a) - getDateMs(b)
    return sortOrder.value === 'asc' ? diff : -diff
  })
})
</script>

<template>
  <div class="controls">
    <div class="controlsGrid">
      <!-- DATE -->
      <section class="section date">
        <div class="sectionTitle">
          Date
        </div>
        <div class="sort">
          <button
            type="button"
            class="sortBtn"
            :class="{ active: sortOrder === 'desc' }"
            @click="sortOrder = 'desc'"
          >
            Plus récents
          </button>
          <button
            type="button"
            class="sortBtn"
            :class="{ active: sortOrder === 'asc' }"
            @click="sortOrder = 'asc'"
          >
            Plus anciens
          </button>
        </div>
      </section>

      <!-- NOM -->
      <section class="section name">
        <div class="sectionTitle">
          Nom
        </div>
        <input
          v-model="nameQuery"
          class="search"
          type="text"
          placeholder="Rechercher… (ex: toto / to.*to)"
        >
      </section>

      <!-- TYPES -->
      <section class="section types">
        <div class="sectionTitle">
          Types
        </div>
        <div class="chips">
          <button
            type="button"
            class="chip"
            :class="{ active: selectedType === 'ALL' }"
            data-tone="neutral"
            @click="selectedType = 'ALL'"
          >
            Tous
          </button>

          <button
            v-for="t in availableTypes"
            :key="t"
            type="button"
            class="chip"
            :class="{ active: selectedType === t }"
            :data-tone="getFileTypeStyle(t)"
            @click="selectedType = t"
          >
            {{ t }}
          </button>
        </div>
      </section>
    </div>
  </div>

  <div class="grid">
    <button
      v-for="file in displayed"
      :key="(file as any).id ?? JSON.stringify(file)"
      class="cell"
      type="button"
      @click="emit('open', file)"
    >
      <FileCard
        :organisme-id
        :organisme-type
        :file
      />
    </button>
  </div>
</template>

<style scoped>
/* ===== Controls frame ===== */
.controls {
  border: 1px solid var(--dsfr-border-default-grey, #ddd);
  border-radius: 12px;
  padding: 12px;
  margin: 12px 0;
}

/* 3 sections horizontales, avec priorité visuelle Types > Date > Nom */
.controlsGrid {
  display: flex;
  gap: 14px;
}

.sectionTitle {
  font-size: 0.78rem;
  font-weight: 650;
  opacity: 0.85;
  margin-bottom: 6px;
}

/* ===== Types chips ===== */
.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-content: flex-start;
}

/* Teintes alignées avec FileCard */
.chip[data-tone='info'] {
  --tint: var(--blue-france-sun-113-625, #0063cb);
}

.chip[data-tone='success'] {
  --tint: var(--green-menthe-sun-373-737, #2e7d32);
}

.chip[data-tone='warning'] {
  --tint: var(--orange-terre-battue-sun-370-672, #ef6c00);
}

.chip[data-tone='danger'] {
  --tint: var(--red-marianne-sun-425-625, #d32f2f);
}

.chip[data-tone='neutral'] {
  --tint: var(--grey-425-625, #666);
}

.chip.active {
  background: color-mix(in srgb, var(--tint) 12%, transparent);
  border-color: color-mix(in srgb, var(--tint) 30%, transparent);
  color: var(--tint);
  font-weight: 650;
}

/* Pastilles: inactif = noir + fond blanc, actif = teinté */
.chip {
  all: unset;
  cursor: pointer;
  user-select: none;

  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--dsfr-border-default-grey, #ddd);
  background: white;
  color: #111;

  font-size: 0.8rem;
  line-height: 1;

  transition:
    background 120ms ease,
    border-color 120ms ease,
    color 120ms ease,
    transform 120ms ease;
}

.chip:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--dsfr-border-default-grey, #ddd) 70%, black 30%);
}

/* (simple) active = bleu, mais si tu veux la teinte par type, on branchera toneByType ici */
.chip.active {
  --tint: var(--blue-france-sun-113-625, #0063cb);
  background: color-mix(in srgb, var(--tint) 12%, transparent);
  border-color: color-mix(in srgb, var(--tint) 30%, transparent);
  color: var(--tint);
  font-weight: 650;
}

/* ===== Sort buttons ===== */
.sort {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.sortBtn {
  all: unset;
  cursor: pointer;
  user-select: none;

  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--dsfr-border-default-grey, #ddd);
  background: white;
  font-size: 0.82rem;

  transition:
    background 120ms ease,
    border-color 120ms ease,
    transform 120ms ease;
}

.sortBtn:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--dsfr-border-default-grey, #ddd) 70%, black 30%);
}

.sortBtn.active {
  border-color: color-mix(in srgb, var(--blue-france-sun-113-625, #0063cb) 35%, transparent);
  background: color-mix(in srgb, var(--blue-france-sun-113-625, #0063cb) 10%, transparent);
  color: var(--blue-france-sun-113-625, #0063cb);
  font-weight: 650;
}

/* ===== Search ===== */
.search {
  width: 100%;
  height: 34px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid var(--dsfr-border-default-grey, #ddd);
  background: white;
  font-size: 0.85rem;
}

.search:focus-visible {
  outline: 2px solid var(--blue-france-sun-113-625, #0063cb);
  outline-offset: 2px;
}

/* ===== Grid ===== */
.grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.cell {
  all: unset;
  cursor: pointer;
  display: block;
}

.cell:focus-visible > * {
  outline: 2px solid var(--blue-france-sun-113-625, #0063cb);
  outline-offset: 2px;
}

/* ✅ compact layout: on garde l’ordre, mais on empile plus vite */
@media (max-width: 1200px), (max-height: 780px) {
  .controls {
    padding: 10px;
  }

  .controlsGrid {
    grid-template-columns: 1fr; /* empile Types / Date / Nom dans l’ordre */
  }

  .grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}
</style>
