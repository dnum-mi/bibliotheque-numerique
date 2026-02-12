<script setup lang="ts">
const props = withDefaults(defineProps<{
  text: string | null | undefined
  title?: string
  limit?: number
}>(), {
  title: 'Information complète',
  limit: 100,
})

const isOpen = ref(false)

const hasLongText = computed(() => {
  return props.text && props.text.length > props.limit
})

const truncatedText = computed(() => {
  if (!props.text) {
    return 'Non renseigné'
  }
  if (!hasLongText.value) {
    return props.text
  }
  return `${props.text.slice(0, props.limit)}...`
})
</script>

<template>
  <div>
    <span class="text-content">
      {{ truncatedText }}
      <button v-if="hasLongText" class="fr-link fr-link--sm fr-text--nowrap" @click.stop="isOpen = true">
        Voir plus
      </button>
    </span>

    <DsfrModal :opened="isOpen" :title="title" @close="isOpen = false">
      <p class="fr-text--md">
        {{ text }}
      </p>
    </DsfrModal>
  </div>
</template>

<style scoped>
.text-content {
  word-break: break-word;
}
</style>
