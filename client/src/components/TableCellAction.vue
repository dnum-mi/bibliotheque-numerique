<template>
  <DsfrButton
    :disabled="disabled"
    :icon="icon"
    tertiary="tertiary"
    icon-only
    @click="showElt"
  />
</template>
<script lang="ts" setup>
const props = withDefaults(defineProps<{
  label:string,
  disabled: boolean,
  icon:string,
  params: any,
}>(), {
  label: '',
  disabled: false,
  icon: 'ri-search-line',
})
const showElt = () => {
  props.params.context.showElt(props.params.data)
}

</script>

<style scoped>

.fr-btn {
  --padding: 0;
}
</style>
