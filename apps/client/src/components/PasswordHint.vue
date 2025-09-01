<script setup lang="ts">
import BnCheckerPassword from './BnCheckerPassword.vue'
import TransitionExpand from './TransitionExpand.vue'

const props = withDefaults(defineProps<{ password?: string, hintText?: string }>(), {
  password: '',
  hintText: 'Votre mot de passe doit contenir au moins :',
})

const strongEnoughPasswordDict = {
  '15 caractères': /^.{15,}$/,
  '1 chiffre': /\d+/,
  '1 majuscule': /[A-Z]+/,
  '1 minuscule': /[a-z]+/,
  '1 caractère spécial': /\W+/,
} as const

type PasswordCheckKey = keyof typeof strongEnoughPasswordDict
const checks = computed<PasswordCheckKey[]>(() => Object.entries(strongEnoughPasswordDict)
  .filter(([, regex]) => !regex.test(props.password))
  .map(([key]) => key as PasswordCheckKey))
</script>

<template>
  <TransitionExpand name="list">
    <div
      v-if="checks.length > 0"
      small
      class="fr-highlight  mt-4  !ml-0"
    >
      <div class="fr-text-label--grey  text-sm  list">
        <span class="fr-hint text-sm">{{ hintText }}</span>
        <TransitionGroup
          name="list"
          tag="ul"
          class="list  p-0  list-none  relative"
        >
          <li
            v-for="(text, i) in (Object.keys(strongEnoughPasswordDict) as PasswordCheckKey[])"
            v-show="checks.includes(text)"
            :key="i"
          >
            <BnCheckerPassword
              :key="i"
              :text="text"
              :valid="!checks.includes(text)"
            />
          </li>
        </TransitionGroup>
      </div>
    </div>
  </TransitionExpand>
</template>

<style scoped>
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease-in-out;
  transition-delay: 0.2s;
  margin: 0;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transition-delay: 0.2s;
}
.list-move {
  transition-delay: 0.2s;
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}

.list {
  transition: all 0.3s ease-in-out;
}
</style>
