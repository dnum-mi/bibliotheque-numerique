<script setup lang="ts">
import { useHealthStore } from '@/stores/health'
import { healthDependenciesDictionary } from '@/components/HealthIndicator/health-dependencies-dictionary.const'

const healthStore = useHealthStore()

const degradedServicesDescription = computed(() =>
  Object.entries(healthStore.health.dependenciesHash)
    .filter(([, v]) => v.status === 'down')
    // @ts-ignore TODO: corriger le type
    .map(([k]) => healthDependenciesDictionary[k]),
)

const isDegraded = computed(() => healthStore.health.status === 'degraded')

const showDegraded = ref(false)

const toggle = () => {
  showDegraded.value = !showDegraded.value
}

const close = () => {
  showDegraded.value = false
}

const container = ref<HTMLElement | null>(null)

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handleClickOutside (event: MouseEvent) {
  if (!container.value) {
    return
  }
  if (!container.value.contains(event.target as Node)) {
    close()
  }
}
</script>

<template>
  <div
    v-if="isDegraded"
    ref="container"
    class="relative health-indicator-root"
  >
    <!-- Bouton icône -->
    <button
      class="fr-btn fr-btn--tertiary-no-outline fr-icon-warning-fill red m-0 p-0"
      aria-label="État du service"
      aria-haspopup="true"
      :aria-expanded="showDegraded"
      aria-controls="health-menu"
      size="small"
      @click="toggle"
    />

    <!-- Popover -->
    <div
      v-show="showDegraded"
      id="health-menu"
      class="absolute right-0 z-50 fr-card fr-p-3w fr-mt-1w"
      style="min-width: 360px"
      role="dialog"
      aria-labelledby="health-title"
    >
      <p
        id="health-title"
        class="fr-text--bold fr-mb-1w red"
      >
        ⚠️ Attention
      </p>

      <ul class="fr-list">
        <li
          v-for="sentence in degradedServicesDescription"
          :key="sentence"
        >
          {{ sentence }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
@media screen and (max-height: 780px) {
}

.health-indicator-root {
  position: relative;
  height: 4px;
  margin-top: -4px;
}

.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

button.red {
  color: red !important;
}

p#health-title {
  color: red !important;
}
</style>
