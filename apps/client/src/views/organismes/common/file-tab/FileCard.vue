<script setup lang="ts">
import { computed } from 'vue'
import type {
  organismeCategoryKey,
  IFile,
} from '@biblio-num/shared'

import { mimeLabelDictionary } from '@/views/organismes/common/file-tab/mime-type-dictionnary.const.ts'
import { getFileTypeStyle } from './file-type-style.const.ts'
import { downloadHubFile } from '@/utils/downloadFile.ts'

const props = defineProps<{ organismeId: string, organismeType:
organismeCategoryKey, file:
IFile }>()

const style = computed(() => getFileTypeStyle(props.file.typeFile))

const dateLabel = computed(() => {
  const d = new Date(props.file.uploadedAt)
  if (Number.isNaN(d.getTime())) {
    return 'Date inconnue'
  }
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: '2-digit' })
})

async function onDownload () {
  await downloadHubFile({
    organismeType: props.organismeType,
    organismeId: props.organismeId,
    file: props.file,
  })
}
</script>

<template>
  <div
    class="card"
    :data-tone="style.tone"
    role="button"
    tabindex="0"
    @click="onDownload"
    @keydown.enter.prevent="onDownload"
    @keydown.space.prevent="onDownload"
  >
    <div class="left">
      <component
        :is="style.icon"
        class="icon"
        aria-hidden="true"
      />
    </div>

    <div class="right">
      <div class="topline">
        <span class="typeWrap">
          <span class="type">{{ file.typeFile }}</span>
        </span>
      </div>

      <div
        class="name"
        :title="file.name"
      >
        {{ file.name }}
      </div>

      <div class="date">
        {{ dateLabel }}
      </div>
    </div>

    <!-- mime: petit, en haut-gauche du badge -->
    <span
      v-if="file.mimeType"
      class="mime"
    >
      {{ mimeLabelDictionary[file.mimeType] }}
    </span>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  position: relative;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;

  /* ✅ taille fixe (desktop) */
  height: 96px;
  overflow: hidden;

  cursor: pointer;
  transition:
    background 120ms ease,
    transform 120ms ease,
    border-color 120ms ease;

  /* fond par défaut neutre (sera surchargé par tone) */
  --card-tint: var(--grey-425-625, #666);
  --card-bg: color-mix(in srgb, var(--card-tint) 10%, transparent);

  background: var(--card-bg);
  border: 1px solid color-mix(in srgb, var(--card-tint) 18%, transparent);
}

.card:hover {
  background: color-mix(in srgb, var(--card-tint) 14%, transparent);
  border-color: color-mix(in srgb, var(--card-tint) 28%, transparent);
}

.card:active {
  transform: translateY(1px);
}

.card:focus-visible {
  outline: 2px solid var(--blue-france-sun-113-625, #0063cb);
  outline-offset: 2px;
}

/* Tonalités → définissent la teinte utilisée par le fond */
.card[data-tone='info'] {
  --card-tint: var(--blue-france-sun-113-625, #0063cb);
}
.card[data-tone='success'] {
  --card-tint: var(--green-menthe-sun-373-737, #2e7d32);
}
.card[data-tone='warning'] {
  --card-tint: var(--orange-terre-battue-sun-370-672, #ef6c00);
}
.card[data-tone='danger'] {
  --card-tint: var(--red-marianne-sun-425-625, #d32f2f);
}
.card[data-tone='neutral'] {
  --card-tint: var(--grey-425-625, #666);
}

/* icon: conserve tes tailles (✅ tu voulais ne pas y toucher) */
.left {
  display: grid;
  place-items: center;
  width: 42px;
}
.icon {
  width: 36px;
  height: 36px;
  color: var(--card-tint);
}

.right {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.topline {
  display: flex;
  min-width: 0;
}

.typeWrap {
  display: inline-flex;
  align-items: baseline;
  min-width: 0;
}

.type {
  font-size: 0.78rem;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ✅ mime discret, mais cohérent avec la teinte */
.mime {
  position: absolute;
  bottom: 8px;
  right: 8px;
  font-size: 0.6rem;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px dashed color-mix(in srgb, var(--card-tint) 35%, transparent);
  background: color-mix(in srgb, white 75%, var(--card-tint) 8%);
  opacity: 0.9;
  white-space: nowrap;
  pointer-events: none;
}

/* ✅ nom: toujours exactement 2 lignes réservées → hauteur identique */
.name {
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.18;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  overflow: hidden;
  word-break: break-word;

  /* astuce: garantit un bloc de 2 lignes même si 1 ligne */
  min-height: calc(2 * 1.18em);
}

.date {
  font-size: 0.78rem;
  font-style: italic;
  opacity: 0.75;
}

/* ✅ compact: seule la carte change de hauteur/padding, PAS les icônes */
@media (max-width: 1200px), (max-height: 780px) {
  .icon {
    width: 26px;
    height: 26px;
  }
  .card {
    height: 84px;
    padding: 5px;
    border-radius: 11px;
    gap: 5px;
  }
}
</style>
