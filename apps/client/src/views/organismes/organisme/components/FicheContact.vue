<script lang="ts" setup>
import type { IAssociationOutput, IFoundationOutput } from '@biblio-num/shared'

const props = defineProps<{
  organisme: IFoundationOutput | IAssociationOutput
}>()

const mapCenter = computed(() => props.organisme.address.coordinates)
const zoom = ref(12)
const mapCard = ref<HTMLElement>()
const mapCardRef = useTemplateRef('mapCard')
</script>

<template>
  <div>
    <div class="px-4 sm:px-0">
      <h3 class="text-base/7 font-semibold text-gray-900 mb-0 fr-background-alt--grey fr-py-3v fr-px-2w">
        Contact
      </h3>
    </div>
    <div class="mt-6 border-t border-gray-100">
      <dl class="divide-y p-0">
        <div
          v-if="mapCenter && mapCenter.length"
          class="flex-basis-[30%] flex-shrink-0 flex-grow-0 inline-block"
        >
          <div class="h-[250px] w-[250px] relative">
            <MapCard
              ref="mapCard"
              :zoom
              :center="mapCenter"
              pin-marker
            />
            <DsfrButton
              type="button"
              icon="ri-focus-3-line"
              tertiary
              title="Recentrer la carte"
              class="rounded-full self-end absolute top-0 right-0"
              icon-only
              @click="mapCardRef?.resetCenter()"
            />
          </div>
        </div>
        <div class="py-2 sm:grid sm:grid-cols-5">
          <dt class="text-sm/6 font-medium text-gray-900">
            Adresse du siège
          </dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
            {{ organisme.address.oneLine }}
          </dd>
        </div>
        <div class="py-2 sm:grid sm:grid-cols-5">
          <dt class="text-sm/6 font-medium text-gray-900">
            Email
          </dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
            {{ organisme.email }}
          </dd>
        </div>
        <div class="py-2 sm:grid sm:grid-cols-5">
          <dt class="text-sm/6 font-medium text-gray-900">
            Téléphone
          </dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
            {{ organisme.phone }}
          </dd>
        </div>
        <div class="py-2 sm:grid sm:grid-cols-5">
          <dt class="text-sm/6 font-medium text-gray-900">
            Site web
          </dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-3 sm:mt-0">
            {{ organisme.website }}
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
