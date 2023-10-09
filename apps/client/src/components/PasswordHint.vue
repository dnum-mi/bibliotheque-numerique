
<script setup lang="ts">
import { computed, type Ref } from 'vue'
import BnCheckerPassword from './BnCheckerPassword.vue'

const props = withDefaults(defineProps<{ password?: string, hintText?: string }>(), {
  password: '',
  hintText: 'Votre mot de passe doit contenir au moins :',
})

const strongEnoughPasswordObject = {
  '15 caractères': /^.{15,}$/,
  '1 chiffre': /\d+/,
  '1 majuscule': /[A-Z]+/,
  '1 minuscule': /[a-z]+/,
  '1 caractère spécial': /\W+/,
}

const checks: Ref<string[]> = computed(() => {
  const result = Object.entries(strongEnoughPasswordObject)
    .filter(([, regex]) => !regex.test(props.password))
    .map(([key]) => key)
  return result
})
</script>

<template>
  <transition name="squeeze">
    <DsfrHighlight
      v-show="checks.length > 0"
      small
      class="mt-4 !ml-0"
    >
      <div class="fr-text-label--grey text-sm">
        <span class="fr-hint text-sm">{{ hintText }}</span>
        <ul class="pl-0">
          <li
            v-for="(text, i) in Object.keys(strongEnoughPasswordObject)"
            :key="i"
            class="list-none"
          >
            <BnCheckerPassword
              :key="i"
              :text="text"
              :valid="!checks.includes(text)"
            />
          </li>
        </ul>
      </div>
    </DsfrHighlight>
  </transition>
</template>

<style scoped>
.squeeze-enter-active {
  transform-origin: top center;
  animation: squeeze-in 1s;
}

.squeeze-leave-active {
  transform-origin: top center;
  animation: squeeze-in 1s reverse;
}

@keyframes squeeze-in {
  0% {
    transform: scaleY(0);
  }

  30% {
    transform: scaleY(0);
  }

  50% {
    transform: scaleY(0.75);
  }

  100% {
    transform: scaleY(1);
  }
}</style>
