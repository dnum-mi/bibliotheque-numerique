<script lang="ts" setup>
// AppToaster
import { DsfrAlert } from '@gouvminint/vue-dsfr'

import type { Message } from '@/composables/use-toaster'

defineProps<{ messages: Message[] }>()
const emit = defineEmits(['close-message'])
const close = (id: string) => emit('close-message', id)
</script>

<template>
  <div class="toaster-container">
    <transition-group
      mode="out-in"
      name="list"
      tag="div"
      class="toasters"
    >
      <DsfrAlert
        v-for="message in messages"
        :key="message.id"
        style="background-color: white; width: 90%;"
        v-bind="message"
        @close="close(message.id as string)"
      />
    </transition-group>
  </div>
</template>

<style scoped>
.toaster-container {
  position: fixed;
  bottom: 1rem;
  width: 100%;
  z-index: 1;
}
.toasters {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: fixed;
}
</style>
