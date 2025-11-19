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
        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Adresse du siège
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            {{ organisme.address.oneLine || 'Non renseigné' }}
          </dd>
        </div>
        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Email
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            {{ organisme.email || 'Non renseigné' }}
          </dd>
        </div>
        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Téléphone
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            {{ organisme.phone || 'Non renseigné' }}
          </dd>
        </div>
        <div class="py-2 md:grid md:grid-cols-4">
          <dt class="bn-fiche-sub-title--label uppercase">
            Site web
          </dt>
          <dd class="bn-fiche-sub-title--text md:col-span-3">
            {{ organisme.website || 'Non renseigné' }}
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
