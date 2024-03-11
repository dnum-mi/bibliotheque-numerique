<script lang="ts" setup>
const props = defineProps<{
  text: string
}>()

const emit = defineEmits<{
  updateNewValue: [text: string],
}>()

const newText = ref<string>('')
const editing = ref<boolean>(false)
const onEdit = () => {
  editing.value = true
  newText.value = props.text
}
const onCancel = () => {
  editing.value = false
}

const onSave = () => {
  emit('updateNewValue', newText.value)
  editing.value = false
}
</script>

<template>
  <div
    v-if="!editing"
    class="flex  items-center"
  >
    <span class="flex-1">{{ text }}</span>
    <DsfrButton
      type="button"
      title="Editer"
      :tertiary="true"
      :no-outline="true"
      @click="onEdit()"
    >
      <span
        class="fr-icon-pencil-line"
        aria-hidden="true"
      />
    </DsfrButton>
  </div>
  <div
    v-else
    class="flex flex-row"
  >
    <DsfrInput
      v-model="newText"
      type="text"
    />
    <DsfrButton
      v-if="editing"
      type="button"
      title="Valider"
      :tertiary="true"
      :no-outline="true"
      @click="onSave()"
    >
      <span
        class="fr-icon-checkbox-line"
        aria-hidden="true"
      />
    </DsfrButton>
    <DsfrButton
      v-if="editing"
      type="button"
      title="Annuler"
      :tertiary="true"
      :no-outline="true"
      @click="onCancel()"
    >
      <span
        class="fr-icon-close-circle-line"
        aria-hidden="true"
      />
    </DsfrButton>
  </div>
</template>
