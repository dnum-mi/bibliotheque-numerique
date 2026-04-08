<script lang="ts" setup>
import { eIdentificationDemarche } from '@biblio-num/shared'
import type { IBasicOrganisme, IDossierFieldsOutput } from '@biblio-num/shared'

import { routeNames } from '@/router/route-names'
import { usePageTitle } from '@/composables/use-page-title'
import { IS_ASSOCIATIONS_ENABLED } from '@/config'

type DossierHeaderProps = {
  dossier: IDossierFieldsOutput
  organisme?: IBasicOrganisme | null
}

const { dossier, organisme } = defineProps<DossierHeaderProps>()

const router = useRouter()

const isAssociation = computed(() => {
  return organisme?.id?.startsWith('W') ?? false
})

const canViewOrganisme = computed(() => {
  if (!organisme) {
    return false
  }
  if (isAssociation.value && !IS_ASSOCIATIONS_ENABLED) {
    return false
  }

  return true
})
const buttonTitle = computed(() => {
  if (!canViewOrganisme.value) {
    return 'La consultation de cette association n\'est pas disponible pour le moment.'
  }
  return 'Voir la fiche de cet organisme'
})

const goToOrganisme = () => {
  if (!canViewOrganisme.value) {
    return
  }
  router.push({
    name: routeNames.FICHE_ORGANISME,
    params: { id: organisme?.id },
  })
}

const isMaarch = computed(() => dossier.demarche.identification === eIdentificationDemarche.MAARCH)

const dossierNumber = computed(() => {
  if (!dossier) {
    return ''
  }
  return `${isMaarch.value ? 'N° Courrier' : 'N° DS'} - ${dossier.sourceId}`
})

const pageTitle = computed(() => `${dossierNumber.value} ${dossier.demarche?.title}`)

usePageTitle(pageTitle)
</script>

<template>
  <header class="flex justify-between gap-2">
    <div class="flex flex-col justify-center">
      <h2
        v-if="organisme"
        class="m-0 p-0 text-lg text-[var(--text-inverted-grey)]"
      >
        {{ organisme.id }} -
        <span class="font-normal">{{ organisme.title }}</span>
      </h2>

      <div class="flex gap-2 text-sm">
        <strong class="font-bold">{{ dossierNumber }}</strong>
        <span>{{ dossier.demarche?.title }}</span>
      </div>
    </div>
    <div v-if="organisme">
      <DsfrButton
        type="button"
        label="Fiche organisme"
        secondary
        class="white-bg"
        :disabled="!canViewOrganisme"
        :title="buttonTitle"
        @click="goToOrganisme()"
      />
    </div>
  </header>
</template>

<style scoped>
.white-bg {
  background-color: white;
}
</style>
