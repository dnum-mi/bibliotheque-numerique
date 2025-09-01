<script lang="ts" setup>
const forceRepaint = (element: HTMLElement) => {
  // Force repaint to make sure the
  // animation is triggered correctly.
  getComputedStyle(element).height // eslint-disable-line ts/no-unused-expressions
}

const enter = (element: HTMLElement) => {
  const width = getComputedStyle(element).width

  element.style.width = width
  element.style.position = 'absolute'
  element.style.visibility = 'hidden'
  element.style.height = 'auto'

  const height = getComputedStyle(element).height

  element.style.width = ''
  element.style.position = ''
  element.style.visibility = ''
  element.style.height = '0'

  forceRepaint(element)

  // Trigger the animation.
  // We use `requestAnimationFrame` because we need
  // to make sure the browser has finished
  // painting after setting the `height`
  // to `0` in the line above.
  requestAnimationFrame(() => {
    element.style.height = height
  })
}

const afterEnter = (element: HTMLElement) => {
  element.style.height = 'auto'
}

const leave = (element: HTMLElement) => {
  const height = getComputedStyle(element).height

  element.style.height = height

  forceRepaint(element)

  requestAnimationFrame(() => {
    element.style.height = '0'
  })
}
</script>

<template>
  <transition
    name="expand"
    @enter="enter($event as HTMLElement)"
    @after-enter="afterEnter($event as HTMLElement)"
    @leave="leave($event as HTMLElement)"
  >
    <slot />
  </transition>
</template>

<style scoped>
* {
  will-change: height;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

.expand-enter-active,
.expand-leave-active {
  transition-duration:  1s;
  transition-property: height, opacity;
  overflow: hidden;
}

.expand-enter,
.expand-leave-to {
  height: 0;
  opacity: 0;
}
</style>
