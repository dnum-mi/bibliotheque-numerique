<script lang="ts" setup>
withDefaults(
  defineProps<{
    titleBgColor?: string
    titleFgColor?: string
    subtitleBgColor?: string
    subtitleFgColor?: string
  }>(),
  {
    titleBgColor: 'var(--background-default-grey)',
    titleFgColor: 'var(--text-default-grey)',
    subtitleBgColor: 'var(--background-default-grey)',
    subtitleFgColor: 'var(--text-default-grey)',
  },
)

const mainEl = ref<HTMLElement | null>(null)
const isAtBottom = ref(true)

const checkBottomScroll = () => {
  const { scrollHeight, scrollTop, clientHeight } = (mainEl.value as HTMLElement) ?? {}
  isAtBottom.value = scrollHeight - scrollTop === clientHeight
}

onMounted(() => {
  mainEl.value?.addEventListener('scroll', checkBottomScroll)
  setTimeout(checkBottomScroll, 300)
})
onBeforeUnmount(() => {
  mainEl.value?.removeEventListener('scroll', checkBottomScroll)
})
</script>

<template>
  <div class="flex flex-col justify-between w-full h-full overflow-y-auto">
    <div
      ref="mainEl"
      class="flex flex-col w-full h-full overflow-y-auto gap-1"
    >
      <div class="bn-fiche-title fr-p-2w">
        <slot name="title" />
      </div>
      <div class="bn-fiche-sub-title bn-dynamic-big-p">
        <slot name="sub-title" />
      </div>
      <div class="h-full">
        <slot name="content" />
      </div>
    </div>
    <footer
      class="footer w-full fr-p-2w text-center"
      :class="{ 'raised-top-shadow': !isAtBottom }"
    >
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
.bn-fiche-title {
  background-color: v-bind(titleBgColor);
  color: v-bind(titleFgColor);
}

.bn-fiche-sub-title {
  background-color: v-bind(subtitleBgColor);
  color: v-bind(subtitleFgColor);
}

.footer {
  transition: all 0.3s ease-in-out;
}
</style>
