<script lang="ts" setup="">
import { useRoute, useRouter } from 'vue-router'
import { computed, ref } from 'vue'

export interface IPagination {
  perPage: number;
  page: number;
}

const route = useRoute()
const router = useRouter()

const props = defineProps<{ total: number }>()
const emit = defineEmits<{
  event: 'paginationUpdated';
  args: IPagination;
}>()

const currentPage = ref(route.query.page || 1)
const perPage = ref(5)

const canNextPage = computed(() => {
  return currentPage.value * perPage.value < props.total
})

const canPreviousPage = computed(() => {
  return currentPage.value > 1
})

const changePage = () => {
  router.push({ ...route, query: { ...route.query, page: currentPage.value } })
  emit('paginationUpdated', { perPage: perPage.value, page: currentPage.value })
}

const nextPage = () => {
  currentPage.value++
  changePage()
}

const previousPage = () => {
  currentPage.value--
  changePage()
}
</script>

<template>
  <div class="flex items-center gap-2">
    <span>
      De {{ (currentPage - 1) * perPage + 1 }} à {{ Math.min(currentPage * perPage, props.total) }} sur
      {{ props.total }}
    </span>
    <DsfrButton
      :disabled="!canPreviousPage"
      icon="ri-arrow-left-s-line"
      icon-only
      @click="previousPage()"
    />
    <span class="fr-mx-2v"> Page {{ currentPage }} / {{ Math.ceil(total / perPage) }} </span>
    <DsfrButton
      :disabled="!canNextPage"
      icon="ri-arrow-right-s-line"
      icon-only
      @click="nextPage()"
    />
  </div>
</template>

<style scoped></style>
