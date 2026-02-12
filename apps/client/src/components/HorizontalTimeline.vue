<script setup lang="ts">
export type TBadgeTypes = 'success' | 'warning' | 'error' | 'info' | 'new'

export interface ITimelineItem {
  key?: string | number
  badgeLabel: string
  badgeType: TBadgeTypes
  text: string
}

defineProps<{
  items: ITimelineItem[]
}>()
</script>

<template>
  <div v-if="items && items.length > 0" class="flex items-center flex-wrap gap-1">
    <div
      v-for="(item, index) in items"
      :key="item.key || index"
      class="flex items-center"
    >
      <span v-if="index > 0" class="separator" aria-hidden="true">|</span>

      <div class="event-item flex items-center justify-center gap-1">
        <DsfrBadge
          :label="item.badgeLabel"
          :type="item.badgeType"
          class="fr-mr-1w badge-uppercase"
          small
        />
        <span class="fr-text--sm fr-text--bold text-default-grey fr-m-0">
          {{ item.text }}
        </span>
      </div>
    </div>
  </div>
  <slot v-else name="empty" />
</template>

<style scoped>
.separator {
  color: var(--border-plain-grey);
  font-weight: 300;
  margin: 0 0.5rem;
}
.text-default-grey {
  color: var(--text-default-grey);
}

.badge-uppercase :deep(.fr-badge) {
  text-transform: uppercase;
}
</style>
