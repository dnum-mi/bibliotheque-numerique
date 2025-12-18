<script lang="ts" setup>
import { eIdentificationDemarche } from '@biblio-num/shared'
import type { IBasicOrganisme, IDossierFieldsOutput } from '@biblio-num/shared'

import { routeNames } from '@/router/route-names'

type DossierHeaderProps = {
  dossier: IDossierFieldsOutput
  organisme?: IBasicOrganisme | null
}

const { dossier, organisme } = defineProps<DossierHeaderProps>()

const router = useRouter()

const goToOrganisme = () => {
  router.push({
    name: routeNames.FICHE_ORGANISME,
    params: { id: organisme?.id },
  })
}

const isMaarch = computed(() => dossier.demarche.identification === eIdentificationDemarche.MAARCH)
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
        <strong class="font-bold">{{ isMaarch ? 'N° Courrier' : 'N° DS' }} - {{ dossier.sourceId }}</strong>
        <span>{{ dossier.demarche?.title }}</span>
      </div>
    </div>
    <div v-if="organisme">
      <DsfrButton
        type="button"
        label="Fiche organisme"
        secondary
        class="white-bg"
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
