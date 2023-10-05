<script lang='ts' setup=''>
defineProps<{
  type: string
  big?: boolean
}>()
</script>

<template>
  <DsfrBadge
    :class="`custom-${type.toLowerCase()}`"
    :label="type"
    :small="!big"
    no-icon
  />
</template>

<style>
.custom-culte {
  color: #6a6156;
  background-color: #feede5;
}

.custom-fdd {
  color: #6e445a;
  background-color: #fee7fc;
}

.custom-fe {
  color: #8d533e;
  background-color: #fef4f2;
}

.custom-arup {
  color: #66673d;
  background-color: var(--green-tilleul-verveine-975-75);
}

.custom-frup {
  color: #66673d;
  background-color: var(--green-tilleul-verveine-975-75);
}
</style>
