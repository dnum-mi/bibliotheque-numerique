<script setup lang="ts">
export interface MultiSelectOption {
  label: string
  value: string | number
}

const props = withDefaults(defineProps<{
  label: string
  options: MultiSelectOption[]
  modelValue: (string | number)[]
  id?: string
  placeholder?: string
}>(), {
  id: () => `multi-select-${Math.random().toString(36).substr(2, 9)}`,
  placeholder: 'Sélectionner...',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: (string | number)[]): void
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const selectedOptions = computed(() => {
  return props.options.filter(opt => props.modelValue.includes(opt.value))
})

const buttonLabel = computed(() => {
  if (props.modelValue.length === 0) {
    return props.placeholder
  }
  if (props.modelValue.length === 1) {
    return selectedOptions.value[0]?.label || props.placeholder
  }
  return `${props.modelValue.length} options sélectionnées`
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const toggleOption = (value: string | number) => {
  const newSelection = [...props.modelValue]
  const index = newSelection.indexOf(value)

  if (index === -1) {
    newSelection.push(value)
  } else {
    newSelection.splice(index, 1)
  }
  emit('update:modelValue', newSelection)
}

const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div ref="containerRef" class="fr-select-group">
    <label class="fr-label" :for="id">
      {{ label }}
    </label>

    <button
      :id="id"
      type="button"
      class="fr-select custom-select-trigger"
      :class="{ 'is-open': isOpen }"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      @click="toggleDropdown"
    >
      <span class="truncate">{{ buttonLabel }}</span>
    </button>

    <div v-if="isOpen" class="custom-dropdown-menu">
      <fieldset class="flex flex-col border-none fr-m-0 fr-p-2w">
        <div
          v-for="(option, idx) in options"
          :key="option.value"
          class="fr-checkbox-group fr-checkbox-group--sm"
        >
          <input
            :id="`${id}-opt-${idx}`"
            :name="`${id}-options`"
            type="checkbox"
            :checked="modelValue.includes(option.value)"
            @change="toggleOption(option.value)"
          >
          <label class="fr-label" :for="`${id}-opt-${idx}`">
            {{ option.label }}
          </label>
        </div>
      </fieldset>
    </div>
  </div>
</template>

<style scoped>
.custom-select-trigger {
  text-align: left;
  width: 100%;
  cursor: pointer;
  position: relative;
}

.custom-select-trigger.is-open {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.custom-dropdown-menu {
  position: absolute;
  display: flex;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--background-default-grey);
  border: 1px solid var(--border-default-grey);
  border-top: none;
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.1);
}

.fr-select-group {
  position: relative;
}

.truncate {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 2rem;
}

.fr-checkbox-group {
  margin-bottom: 0.5rem;
}
.fr-checkbox-group:last-child {
  margin-bottom: 0;
}
</style>
