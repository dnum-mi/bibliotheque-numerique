<script setup lang="ts">
import { formatBytes, getFileFormat } from '@/utils/file.utils'
import { typeFileArray } from '@biblio-num/shared'
import type { IFile, RnaTypeFileKey, RnaTypeRecepisseKey, TypeFileKey } from '@biblio-num/shared'

const props = defineProps<{
  files: IFile[]
}>()

const groupedFiles = computed(() => {
  const groups: Record<string, IFile[]> = {}
  typeFileArray.forEach((cat) => {
    groups[cat] = []
  })
  groups['Autres documents'] = []

  props.files.forEach((file) => {
    const type = file.typeFile
    if (type && typeFileArray.includes(type)) {
      groups[type]?.push(file)
    } else {
      groups['Autres documents']?.push(file)
    }
  })
  return groups
})

const allCategories = computed(() => Object.keys(groupedFiles.value))

const firstNonEmptyAccordionIndex = computed(() => {
  return allCategories.value.findIndex((categoryName) => {
    return groupedFiles.value[categoryName]!.length > 0
  })
})

const activeAccordion = ref<number>(firstNonEmptyAccordionIndex.value)

watch(firstNonEmptyAccordionIndex, (newIndex) => {
  activeAccordion.value = newIndex
})

const getThumbnailIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) {
    return 'ri-image-2-line'
  }
  switch (mimeType) {
    case 'application/pdf':
      return 'vi-file-type-pdf2'
    case 'application/zip':
    case 'application/x-zip-compressed':
      return 'vi-file-type-zip'
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/msword':
      return 'vi-file-type-word2'
    case 'application/vnd.oasis.opendocument.text':
      return 'vi-file-type-word2'
    default:
      return 'vi-file-type-image' // Icône générique
  }
}

const dateToStringFr = (date: Date | string | null): string => {
  if (!date) {
    return ''
  }
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const getFileDetail = (file: IFile): string => {
  let type: TypeFileKey | RnaTypeFileKey | RnaTypeRecepisseKey | 'Document' | null = file.typeFile
  if (!type && file.rnaFile) {
    type = file.rnaFile.typePiece || file.rnaFile.typeRecepisse
  }
  if (!type) {
    type = 'Document' // Fallback
  }

  const date = file.effectiveAt ? dateToStringFr(file.effectiveAt) : null
  return date ? `${type} - ${date}` : type
}
</script>

<template>
  <DsfrAccordionsGroup
    v-model="activeAccordion"
    class="px-2 py-4"
  >
    <DsfrAccordion
      v-for="(categoryName, index) in allCategories"
      :id="`accordion-${index}`"
      :key="categoryName"
      :title="`${categoryName} (${groupedFiles[categoryName]!.length})`"
    >
      <div
        v-if="!groupedFiles[categoryName]!.length"
        class="fr-p fr-pl-4v"
      >
        Aucun document de ce type.
      </div>

      <div
        v-else
        class="flex flex-row"
      >
        <div
          v-for="file in groupedFiles[categoryName]"
          :key="file.id"
          class=""
        >
          <div class="file-card fr-p-2w fr-border fr-border--grey-900 fr-rounded-sm">
            <div class="file-thumbnail">
              <VIcon
                :name="getThumbnailIcon(file.mimeType)"
                scale="6"
                class="mr-1"
              />
            </div>

            <DsfrFileDownload
              :title="file.name"
              :format="getFileFormat(file.mimeType)"
              :size="formatBytes(file.byteSize)"
              :detail="getFileDetail(file)"
              href="#"
              :download="file.originalName"
              class="fr-mt-2v"
            />
          </div>
        </div>
      </div>
    </DsfrAccordion>
  </DsfrAccordionsGroup>
</template>

<style scoped>
.file-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.file-thumbnail {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
}

.file-thumbnail i {
  font-size: 4rem;
  color: var(--text-action-high-blue-france);
}

.file-card :deep(.fr-download) {
  border: none;
  box-shadow: none;
  padding: 0;
  background-color: transparent;
}

.file-card :deep(.fr-download__title) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
